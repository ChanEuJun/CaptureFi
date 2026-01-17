const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDsRGIy7pKt2dmRkZZFKagdiGhCOL7fRCk");


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
            extra_info: JSON.parse(row.extra_info || '{}')
        }));
        res.json(content);
    });
});

app.post('/api/captures', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Processing capture for: ${url}`);

    // Call Python processor
    const pythonProcess = spawn('python3', [path.join(__dirname, 'processor.py'), url]);

    let resultData = '';
    pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: 'Failed to extract content' });
        }

        try {
            const extracted = JSON.parse(resultData);
            if (extracted.error) {
                return res.status(500).json({ error: extracted.error });
            }

            const id = Date.now().toString(); // Simple ID generation
            const source = new URL(url).hostname;
            const excerpt = extracted.content.substring(0, 150) + '...';

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
                JSON.stringify([]), // Default empty tags
                url,
                extracted.content,
                JSON.stringify(extracted.extra_info || {}),
                0 // no narrative yet
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
            res.status(500).json({ error: 'Failed to parse extraction result' });
        }
    });
});

app.post('/api/content/:id/generate', async (req, res) => {
    const { id } = req.params;

    db.get('SELECT full_content FROM content WHERE id = ?', [id], async (err, row) => {
        if (err || !row) {
            return res.status(500).json({ error: 'Content not found' });
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Based on the following text, provide:
            1. A very short summary, emphasizing the impact of cryptocurrencies.
            2. Three key highlights or quotes.
            
            Return the result in strictly this JSON format:
            {
                "summary": "...",
                "highlights": ["...", "...", "..."]
            }
            
            Text: ${row.full_content}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up the response in case Gemini adds markdown code blocks
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const narrative = JSON.parse(jsonStr);

            db.run('UPDATE content SET narrative = ?, hasNarrative = 1 WHERE id = ?', [JSON.stringify(narrative), id], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ error: 'Failed to update database' });
                }
                res.json({ success: true, narrative });
            });

        } catch (e) {
            console.error('Gemini error:', e);
            res.status(500).json({ error: 'AI generation failed' });
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
            extra_info: JSON.parse(row.extra_info || '{}')
        };
        res.json(content);
    });
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

