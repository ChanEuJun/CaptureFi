const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 3001;

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log("Gemini API Key loaded:", apiKey ? "YES" : "NO");

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Mock Policy State
let saltPolicy = {
    maxTradeSize: 1000,
    allowedAssets: ["OP", "ARB", "ETH", "BTC", "SOL"],
    allowShorts: true
};

app.get('/api/content', (req, res) => {
    db.all('SELECT * FROM content ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse JSON fields
        const content = rows.map(row => ({
            ...row,
            tags: JSON.parse(row.tags || '[]'),
            narrative: JSON.parse(row.narrative || 'null'),
            extra_info: JSON.parse(row.extra_info || '{}'),
            hasNarrative: Boolean(row.hasNarrative)
        }));
        res.json(content);
    });
});

app.post('/api/captures', (req, res) => {
    const { url, extractedContent } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Processing capture for: ${url}`);

    // If content was extracted from DOM, use it directly
    if (extractedContent && extractedContent.fullContent) {
        const id = Date.now().toString();
        const source = new URL(url).hostname;
        const content = extractedContent.fullContent;
        const excerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');

        const query = `INSERT INTO content 
            (id, type, title, excerpt, source, author, tags, url, full_content, extra_info, hasNarrative) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            id,
            'twitter',
            `Twitter Post ${url.match(/\/status\/(\d+)/)?.[1] || 'Unknown'}`,
            excerpt,
            source,
            'Unknown',
            JSON.stringify([]),
            url,
            content,
            JSON.stringify({
                method: 'dom_extraction',
                images: extractedContent.images || []
            }),
            0
        ];

        db.run(query, params, function (err) {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: 'Failed to save to database' });
            }
            res.json({ success: true, id: id });
        });
        return;
    }

    // Otherwise, use processor.py for content extraction
    const pythonProcess = spawn('python3', [path.join(__dirname, 'processor.py'), url]);

    let resultData = '';
    pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        // Clean the result data - remove any non-JSON content
        resultData = resultData.trim();

        // Try to extract JSON from the output (in case there's extra text)
        let jsonMatch = resultData.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            resultData = jsonMatch[0];
        }

        if (code !== 0) {
            // Try to parse error message if it's JSON
            try {
                const errorData = JSON.parse(resultData);
                return res.status(500).json({ error: errorData.error || 'Failed to extract content' });
            } catch {
                return res.status(500).json({ error: 'Failed to extract content' });
            }
        }

        try {
            const extracted = JSON.parse(resultData);
            if (extracted.error) {
                console.error('Extraction error:', extracted.error);
                return res.status(500).json({ error: extracted.error });
            }

            const id = Date.now().toString();
            const source = new URL(url).hostname;
            const excerpt = extracted.content.substring(0, 150) + (extracted.content.length > 150 ? '...' : '');

            const query = `INSERT INTO content 
                (id, type, title, excerpt, source, author, tags, url, full_content, extra_info, hasNarrative) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                id,
                extracted.type,
                extracted.title || 'Untitled',
                excerpt,
                source,
                extracted.author || 'Unknown',
                JSON.stringify([]),
                url,
                extracted.content,
                JSON.stringify(extracted.extra_info || {}),
                0
            ];

            db.run(query, params, function (err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).json({ error: 'Failed to save to database' });
                }
                res.json({ success: true, id: id });
            });

        } catch (e) {
            console.error('Parsing error:', e);
            console.error('Raw output:', resultData.substring(0, 200));
            res.status(500).json({ error: 'Failed to parse extraction result' });
        }
    });
});

app.get('/api/content/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM content WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Content not found' });
            return;
        }
        const content = {
            ...row,
            tags: JSON.parse(row.tags || '[]'),
            narrative: JSON.parse(row.narrative || 'null'),
            extra_info: JSON.parse(row.extra_info || '{}'),
            hasNarrative: Boolean(row.hasNarrative)
        };
        res.json(content);
    });
});

app.post('/api/agent/chat', async (req, res) => {
    const { message, history } = req.body;

    // 1. Intent Detection (Simple Keyword Matching for Demo)
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("set max trade") || lowerMsg.includes("limit trade")) {
        const amountMatch = message.match(/\$?(\d+)/);
        if (amountMatch) {
            saltPolicy.maxTradeSize = parseInt(amountMatch[1]);
            return res.json({
                success: true,
                reply: `✅ Salt Policy Updated.\nMax Trade Size set to $${saltPolicy.maxTradeSize}.`,
                citations: [],
                policyState: saltPolicy
            });
        }
    }

    if (lowerMsg.includes("disable shorts") || lowerMsg.includes("no shorts")) {
        saltPolicy.allowShorts = false;
        return res.json({
            success: true,
            reply: `✅ Salt Policy Updated.\nShort positions are now BLOCKED.`,
            citations: [],
            policyState: saltPolicy
        });
    }

    if (lowerMsg.includes("enable shorts") || lowerMsg.includes("allow shorts")) {
        saltPolicy.allowShorts = true;
        return res.json({
            success: true,
            reply: `✅ Salt Policy Updated.\nShort positions are now ALLOWED.`,
            citations: [],
            policyState: saltPolicy
        });
    }

    try {
        const getContext = new Promise((resolve, reject) => {
            db.all('SELECT * FROM content ORDER BY created_at DESC LIMIT 20', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        const rows = await getContext;
        const contextDocs = rows.map(r => `[ID: ${r.id}] title: "${r.title}" source: ${r.source}\ncontent: ${r.excerpt}`).join("\n---\n");

        if (!apiKey) {
            console.warn("No API Key - Returning Mock Data for Chat");
            return res.json({
                success: true,
                reply: "Based on your saved content, I'm seeing a strong rotation into L2s.",
                citations: ["1"],
                policyState: saltPolicy,
                strategy: {
                    description: "Long OP / Short ETH (L2 Rotation)",
                    type: "PAIR",
                    longs: ["OP"],
                    shorts: ["ETH"],
                    rationale: "Mock Rationale: L2 growth outpacing L1.",
                    withinPolicy: true
                }
            });
        }

        const prompt = `
        You are the "CaptureFi" AI Agent. Your goal is to help the user find "Alpha" in their captured content.
        
        User Query: "${message}"

        Here is the User's captured content library (Context):
        """
        ${contextDocs}
        """

        Current Salt Policy:
        - Max Trade Size: $${saltPolicy.maxTradeSize}
        - Allow Shorts: ${saltPolicy.allowShorts}
        - Allowed Assets: ${saltPolicy.allowedAssets.join(", ")}

        Instructions:
        1. Answer the user's query based *only* on the provided content.
        2. If the user asks for a trade/beta/alpha, output a specific PAIR or BASKET trade.
        3. Check if the trade complies with the Salt Policy.
        4. Cite your sources by ID.
        
        Output JSON Schema:
        {
            "reply": "Your conversational answer here...",
            "citations": ["id_1", "id_2"],
            "strategy": { 
                "description": "Short summary of trade",
                "type": "PAIR" | "BASKET",
                "longs": ["TokenA"], 
                "shorts": ["TokenB"],
                "confidence": 80,
                "withinPolicy": true/false
            } 
        }
        (Strategy is Optional, include ONLY if a trade is suggested)
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            return res.json({ success: true, reply: text, citations: [], policyState: saltPolicy });
        }

        const data = JSON.parse(jsonMatch[0]);
        res.json({ success: true, ...data, policyState: saltPolicy });

    } catch (error) {
        console.error("Agent Chat Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/execute-trade', (req, res) => {
    const { strategy, userAddress } = req.body;
    console.log(`[Pear Execution] Strategy received for ${userAddress}:`, strategy);

    // Mock Execution Logic
    // 1. Validate Strategy
    if (!strategy || !strategy.type) {
        return res.status(400).json({ error: "Invalid strategy" });
    }

    // 2. Simulate Delay and Tx
    setTimeout(() => {
        const mockTxHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        res.json({
            success: true,
            txHash: mockTxHash,
            message: `Successfully executed ${strategy.type} trade via Pear Protocol`
        });
    }, 1500);
});

app.put('/api/content/:id', (req, res) => {
    const { id } = req.params;
    const { tags, narrative, hasNarrative } = req.body;

    let fields = [];
    let params = [];

    if (tags) {
        fields.push("tags = ?");
        params.push(JSON.stringify(tags));
    }
    if (narrative) {
        fields.push("narrative = ?");
        params.push(JSON.stringify(narrative));
    }
    if (typeof hasNarrative !== 'undefined') {
        fields.push("hasNarrative = ?");
        params.push(hasNarrative ? 1 : 0);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id);

    const query = `UPDATE content SET ${fields.join(", ")} WHERE id = ?`;

    db.run(query, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, changes: this.changes });
    });
});

app.delete('/api/content/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM content WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, deleted: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
