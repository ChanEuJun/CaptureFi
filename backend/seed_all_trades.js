const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

function runQuery(database, query, params = []) {
    return new Promise((resolve, reject) => {
        database.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function seed() {
    try {
        console.log('Starting seed process...');

        // Initialize tables if they don't exist
        await runQuery(db, `CREATE TABLE IF NOT EXISTS trade_ideas (
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

        await runQuery(db, `CREATE TABLE IF NOT EXISTS final_trades (
            id TEXT PRIMARY KEY,
            symbol TEXT,
            side TEXT,
            entry_price TEXT,
            stop_loss TEXT,
            take_profit TEXT,
            rationale TEXT,
            status TEXT,
            bridge_info TEXT,
            finalized_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 1. Clear tables
        await runQuery(db, 'DELETE FROM trade_ideas');
        await runQuery(db, 'DELETE FROM final_trades');

        // Seed Trade Ideas
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
            }
        ];

        const ideaStmt = db.prepare('INSERT INTO trade_ideas (id, symbol, side, entry_price, stop_loss, take_profit, rationale, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        tradeIdeas.forEach(t => ideaStmt.run(t.id, t.symbol, t.side, t.entry_price, t.stop_loss, t.take_profit, t.rationale, t.status));
        ideaStmt.finalize();

        console.log('Seed process completed successfully.');
        console.log('- trade_ideas table seeded.');
        console.log('- final_trades table left empty (waiting for user to finalize trades).');

    } catch (err) {
        console.error('Seed process failed:', err);
    } finally {
        db.close();
    }
}

seed();
