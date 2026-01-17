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

    // Otherwise, save URL with basic metadata (processor.py removed)
    const id = Date.now().toString();
    const source = new URL(url).hostname;
    const title = req.body.title || `Content from ${source}`;
    const excerpt = `Saved from ${url}`;

    const query = `INSERT INTO content 
        (id, type, title, excerpt, source, author, tags, url, full_content, extra_info, hasNarrative) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        id,
        'article',
        title,
        excerpt,
        source,
        'Unknown',
        JSON.stringify([]),
        url,
        `Content saved from: ${url}\n\nPlease visit the URL to view the full content.`,
        JSON.stringify({ method: 'basic_save', saved_at: new Date().toISOString() }),
        0
    ];

    db.run(query, params, function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Failed to save to database' });
        }
        res.json({ success: true, id: id });
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

app.listen(port, () => {

    console.log(`Backend server running at http://localhost:${port}`);
});

