const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const finalDbPath = path.resolve(__dirname, 'final_trades.sqlite');

const db = new sqlite3.Database(dbPath);
const finalDb = new sqlite3.Database(finalDbPath);

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

        await runQuery(finalDb, `CREATE TABLE IF NOT EXISTS final_trades (
            id TEXT PRIMARY KEY,
            symbol TEXT,
            side TEXT,
            entry_price TEXT,
            stop_loss TEXT,
            take_profit TEXT,
            rationale TEXT,
            status TEXT,
            finalized_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await runQuery(finalDb, `CREATE TABLE IF NOT EXISTS final_bridges (
            id TEXT PRIMARY KEY,
            symbol TEXT,
            side TEXT,
            entry_price TEXT,
            stop_loss TEXT,
            take_profit TEXT,
            rationale TEXT,
            status TEXT,
            bridge_info TEXT,
            bridged_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 1. Clear Trade Ideas in main database
        await runQuery(db, 'DELETE FROM trade_ideas');

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

        // 2. Clear Final Database
        await runQuery(finalDb, 'DELETE FROM final_trades');
        await runQuery(finalDb, 'DELETE FROM final_bridges');

        // Seed Final Bridges (Bridge and Execute section)
        const bridgeInfo = {
            quote: '124.50 SOL',
            eta: '4 mins',
            steps: ['Source Chain (Base)', 'Cross-Chain Bridge', 'Destination (Solana)', 'Final Swap'],
            progress: 1,
            finalAmount: '123.95 SOL'
        };

        const finalBridges = [
            {
                id: 'fb1',
                symbol: 'SOL/USDC',
                side: 'LONG',
                entry_price: '98.20',
                stop_loss: '92.00',
                take_profit: '120.00',
                rationale: 'Arbitrage opportunity between dexes detected via aggregator.',
                status: 'BRIDGING',
                bridge_info: JSON.stringify(bridgeInfo)
            }
        ];

        const bridgeStmt = finalDb.prepare('INSERT INTO final_bridges (id, symbol, side, entry_price, stop_loss, take_profit, rationale, status, bridge_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        finalBridges.forEach(t => bridgeStmt.run(t.id, t.symbol, t.side, t.entry_price, t.stop_loss, t.take_profit, t.rationale, t.status, t.bridge_info));
        bridgeStmt.finalize();

        // final_trades (Automate Trades) is left empty as requested.

        console.log('Seed process completed successfully.');
        console.log('- Main database (trade_ideas) seeded.');
        console.log('- Final database (final_bridges) seeded.');
        console.log('- Final database (final_trades/automate) left empty.');

    } catch (err) {
        console.error('Seed process failed:', err);
    } finally {
        db.close();
        finalDb.close();
    }
}

seed();
