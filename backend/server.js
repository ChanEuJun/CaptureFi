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

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        type TEXT,
        title TEXT,
        excerpt TEXT,
        source TEXT,
        author TEXT,
        tags TEXT,
        url TEXT,
        full_content TEXT,
        extra_info TEXT,
        hasNarrative INTEGER,
        readTime TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS trade_ideas (
        id TEXT PRIMARY KEY,
        symbol TEXT,
        side TEXT,
        entry_price TEXT,
        stop_loss TEXT,
        take_profit TEXT,
        rationale TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

app.get('/api/trade-ideas', (req, res) => {
    db.all('SELECT * FROM trade_ideas ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
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
            (id, type, title, excerpt, source, author, tags, url, full_content, extra_info, hasNarrative, readTime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            id,
            'twitter',
            `Twitter Post ${url.match(/\/status\/(\d+)/)?.[1] || 'Unknown'}`,
            excerpt,
            source,
            'Unknown',
            JSON.stringify([]), // We could implement JS tagging here too, but processor.py is primary
            url,
            content,
            JSON.stringify({
                method: 'dom_extraction',
                images: extractedContent.images || []
            }),
            0,
            readTime
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
                (id, type, title, excerpt, source, author, tags, url, full_content, extra_info, hasNarrative, readTime) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                id,
                extracted.type,
                extracted.title || 'Untitled',
                excerpt,
                source,
                extracted.author || 'Unknown',
                JSON.stringify(extracted.tags || []),
                url,
                extracted.content,
                JSON.stringify(extracted.extra_info || {}),
                0,
                extracted.readTime || '1 min'
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

app.listen(port, () => {

    console.log(`Backend server running at http://localhost:${port}`);
});

