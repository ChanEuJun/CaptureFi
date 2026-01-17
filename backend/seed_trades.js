const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
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

const tradeIdeas = [
    {
        id: 't1',
        symbol: 'BTC/USDT',
        side: 'LONG',
        entry_price: '42500',
        stop_loss: '41000',
        take_profit: '46000',
        rationale: 'RSI divergence on 4h timeframe and bounce from key support level.',
        status: 'ACTIVE'
    },
    {
        id: 't2',
        symbol: 'ETH/USDT',
        side: 'SHORT',
        entry_price: '2550',
        stop_loss: '2650',
        take_profit: '2300',
        rationale: 'Rejected from major resistance zone. Volume decreasing on upwards move.',
        status: 'ACTIVE'
    },
    {
        id: 't3',
        symbol: 'SOL/USDT',
        side: 'LONG',
        entry_price: '95.50',
        stop_loss: '90.00',
        take_profit: '115.00',
        rationale: 'Strong momentum after breakout. Ecosystem growth remains robust.',
        status: 'ACTIVE'
    }
];

db.serialize(() => {
    db.run('DELETE FROM trade_ideas');

    const stmt = db.prepare('INSERT INTO trade_ideas (id, symbol, side, entry_price, stop_loss, take_profit, rationale, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

    tradeIdeas.forEach(trade => {
        stmt.run(trade.id, trade.symbol, trade.side, trade.entry_price, trade.stop_loss, trade.take_profit, trade.rationale, trade.status);
    });

    stmt.finalize();
    console.log('Seeded 3 trade ideas.');
});

db.close();
