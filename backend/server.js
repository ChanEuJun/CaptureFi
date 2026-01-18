const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const ethers = require('ethers');
require('dotenv').config();

const PEAR_PRIVATE_KEY = process.env.PEAR_PRIVATE_KEY;
const PEAR_API_URL = process.env.PEAR_API_URL || 'https://hl-v2.pearprotocol.io';
const PEAR_CLIENT_ID = process.env.PEAR_CLIENT_ID || 'APITRADER';

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        type TEXT,
        title TEXT,
        excerpt TEXT,
        source TEXT,
        author TEXT,
        date TEXT,
        readTime TEXT,
        tags TEXT,
        thumbnail TEXT,
        hasNarrative INTEGER,
        narrative TEXT,
        url TEXT,
        full_content TEXT,
        extra_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS trade_ideas (
        id TEXT PRIMARY KEY,
        symbol TEXT,
        title TEXT,
        side TEXT,
        entry_price TEXT,
        stop_loss TEXT,
        take_profit TEXT,
        rationale TEXT,
        metadata TEXT, -- JSON for rich pair trade details
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS final_trades (
        id TEXT PRIMARY KEY,
        symbol TEXT,
        title TEXT,
        side TEXT,
        entry_price TEXT,
        stop_loss TEXT,
        take_profit TEXT,
        rationale TEXT,
        metadata TEXT,
        status TEXT,
        bridge_info TEXT,
        finalized_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

app.get('/api/trade-ideas', (req, res) => {
    db.all('SELECT * FROM trade_ideas ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const trades = rows.map(row => ({
            ...row,
            metadata: JSON.parse(row.metadata || 'null')
        }));
        res.json(trades);
    });
});

app.get('/api/final-trades', (req, res) => {
    db.all('SELECT * FROM final_trades ORDER BY finalized_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse bridge_info and metadata
        const trades = rows.map(row => ({
            ...row,
            bridge_info: JSON.parse(row.bridge_info || '{}'),
            metadata: JSON.parse(row.metadata || 'null')
        }));
        res.json(trades);
    });
});



app.get('/api/trade-ideas/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM trade_ideas WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Trade idea not found' });
        res.json({ ...row, metadata: JSON.parse(row.metadata || 'null') });
    });
});

app.get('/api/final-trades/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM final_trades WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Final trade not found' });
        res.json({
            ...row,
            metadata: JSON.parse(row.metadata || 'null'),
            bridge_info: JSON.parse(row.bridge_info || '{}')
        });
    });
});

app.post('/api/trade-ideas/:id/finalize', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM trade_ideas WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Trade idea not found' });
        }

        const bridgeInfo = {
            quote: '0.5 ETH',
            eta: '5 mins',
            steps: ['Approve', 'Bridge', 'Swap'],
            progress: 0,
            finalAmount: '0.495 ETH'
        };

        const query = `INSERT INTO final_trades 
            (id, symbol, title, side, entry_price, stop_loss, take_profit, rationale, metadata, status, bridge_info) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(query, [
            row.id,
            row.symbol,
            row.title,
            row.side,
            row.entry_price,
            row.stop_loss,
            row.take_profit,
            row.rationale,
            row.metadata,
            'BRIDGING',
            JSON.stringify(bridgeInfo)
        ], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
    });
});

app.post('/api/final-trades/:id/bridge', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM final_trades WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Final trade not found' });
        }

        res.json({ success: true, message: 'Bridge already initialized' });
    });
});

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

        // Simple read time for DOM extraction
        const words = content.split(/\s+/).length;
        const readTime = Math.ceil(words / 200) + ' min' + (Math.ceil(words / 200) > 1 ? 's' : '');

        const query = `INSERT INTO content 
            (id, type, title, excerpt, source, author, date, readTime, tags, thumbnail, hasNarrative, narrative, url, full_content, extra_info) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            id,
            'twitter',
            `Twitter Post ${url.match(/\/status\/(\d+)/)?.[1] || 'Unknown'}`,
            excerpt,
            source,
            'Unknown',
            new Date().toLocaleDateString(),
            readTime,
            JSON.stringify([]),
            null,
            0,
            JSON.stringify(null),
            url,
            content,
            JSON.stringify({
                method: 'dom_extraction',
                images: extractedContent.images || []
            })
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
                (id, type, title, excerpt, source, author, date, readTime, tags, thumbnail, hasNarrative, narrative, url, full_content, extra_info) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                id,
                extracted.type,
                extracted.title || 'Untitled',
                excerpt,
                source,
                extracted.author || 'Unknown',
                new Date().toLocaleDateString(),
                extracted.readTime || '1 min',
                JSON.stringify(extracted.tags || []),
                extracted.extra_info?.thumbnail || extracted.extra_info?.top_image || null,
                0,
                JSON.stringify(null),
                url,
                extracted.content,
                JSON.stringify(extracted.extra_info || {})
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

app.delete('/api/trade-ideas/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM trade_ideas WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, deleted: this.changes });
    });
});

app.delete('/api/final-trades/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM final_trades WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, deleted: this.changes });
    });
});

app.post('/api/pear/trade', async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount < 1 || amount > 10) {
        return res.status(400).json({ error: 'Trade amount must be between $1 and $10' });
    }

    if (!PEAR_PRIVATE_KEY) {
        return res.status(500).json({ error: 'Pear private key not configured' });
    }

    try {
        const wallet = new ethers.Wallet(PEAR_PRIVATE_KEY);
        const address = await wallet.getAddress();

        console.log(`Pear Trade: Authenticating for address ${address}...`);

        // 1. Get EIP-712 message
        const messageRes = await fetch(`${PEAR_API_URL}/auth/eip712-message?address=${address}&clientId=${PEAR_CLIENT_ID}`);
        if (!messageRes.ok) {
            const errText = await messageRes.text();
            throw new Error(`Failed to get EIP-712 message: ${errText}`);
        }
        const eip712 = await messageRes.json();
        const addressLower = address.toLowerCase();

        // 2. Sign message
        // Ethers v6 signTypedData(domain, types, value)
        // We need to remove EIP712Domain from types if it exists
        const types = { ...eip712.types };
        delete types.EIP712Domain;

        const message = eip712.value || eip712.message;

        const signature = await wallet.signTypedData(
            eip712.domain,
            types,
            message
        );

        // 3. Login
        const loginRes = await fetch(`${PEAR_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 'eip712',
                address: addressLower,
                clientId: PEAR_CLIENT_ID,
                details: {
                    signature,
                    timestamp: eip712.timestamp || message.timestamp
                }
            })
        });

        if (!loginRes.ok) {
            const errText = await loginRes.text();
            throw new Error(`Login failed: ${errText}`);
        }
        const { accessToken } = await loginRes.json();

        // 4. Check/Create Agent Wallet (might be needed for Hyperliquid)
        console.log('Pear Trade: Checking agent wallet...');
        const agentWalletRes = await fetch(`${PEAR_API_URL}/agentWallet`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (agentWalletRes.status === 404) {
            console.log('Pear Trade: Creating agent wallet...');
            await fetch(`${PEAR_API_URL}/agentWallet`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        }

        // 5. Execute Trade: Long SOL, Short BTC
        console.log(`Pear Trade: Executing pair trade for $${amount}...`);
        const tradeRes = await fetch(`${PEAR_API_URL}/positions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                slippage: 0.01,
                executionType: 'MARKET',
                leverage: 5,
                usdValue: parseFloat(amount),
                longAssets: [{ asset: 'SOL', weight: 0.5 }],
                shortAssets: [{ asset: 'BTC', weight: 0.5 }]
            })
        });

        if (!tradeRes.ok) {
            const errText = await tradeRes.text();
            throw new Error(`Trade failed: ${errText}`);
        }

        const tradeData = await tradeRes.json();
        res.json({ success: true, trade: tradeData });

    } catch (error) {
        console.error('Pear Trade Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {

    console.log(`Backend server running at http://localhost:${port}`);
});

