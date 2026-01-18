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
        await runQuery(db, `DROP TABLE IF EXISTS trade_ideas`);
        await runQuery(db, `DROP TABLE IF EXISTS final_trades`);

        await runQuery(db, `CREATE TABLE IF NOT EXISTS trade_ideas (
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await runQuery(db, `CREATE TABLE IF NOT EXISTS final_trades (
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

        // 1. Clear tables
        await runQuery(db, 'DELETE FROM trade_ideas');
        await runQuery(db, 'DELETE FROM final_trades');

        // Seed Trade Ideas
        const tradeIdeas = [
            {
                id: 'pair-1',
                symbol: 'BTC / ALTS',
                title: 'Long Bitcoin / Short Altcoin Basket',
                side: 'PAIR',
                entry_price: '102,000',
                stop_loss: '95,000',
                take_profit: '150,000',
                rationale: 'Capital concentrating in Bitcoin as institutional demand outpaces supply by 3.5x.',
                metadata: JSON.stringify({
                    specifications: [
                        { label: 'Asset', long: 'Bitcoin (BTC)', short: 'Altcoin Basket (25% ETH, 25% ADA, 25% DOT, 25% AVAX)' },
                        { label: 'Entry Price', long: 'BTC @ $102,000', short: 'ETH @ $2,600, ADA @ $0.90, DOT @ $7.20, AVAX @ $38.00' },
                        { label: 'Position Size', long: '1 BTC ($102,000)', short: '$25,500 each (total $102,000)' },
                        { label: 'Stop Loss', long: '$95,000 (-6.9%)', short: 'Basket +8%' },
                        { label: 'Take Profit 1', long: '$106,000 (+3.9%)', short: 'Basket -5%' },
                        { label: 'Take Profit 2', long: '$150,000 (+47%)', short: 'Basket -30%' },
                        { label: 'Take Profit 3', long: '$1,000,000 (+880%)', short: 'Basket -70%' },
                        { label: 'Time Horizon', long: '6-48 months', short: '6-48 months' }
                    ],
                    quotes: [
                        { category: 'Supply/Demand Imbalance', text: '"Sailor alone through Micro Strategy is buying up 76% of the daily added bitcoin into the circulating supply"' },
                        { category: 'Supply/Demand Imbalance', text: '"In complete total you have 3.5 times the entire new added bitcoin supply on a daily basis accumulated by institutions and companies"' },
                        { category: 'BTC Dominance Thesis', text: '"Bitcoin dominance is one of the most important metrics to watch this cycle. We\'ve seen a clear trend of capital concentrating in the king of crypto."' },
                        { category: 'Altcoin Weakness', text: '"Meanwhile, the altcoin market is fragmented. There\'s too much supply and not enough demand to sustain thousands of projects."' }
                    ]
                }),
                status: 'ACTIVE'
            },
            {
                id: 'pair-2',
                symbol: 'ARB / L1s',
                title: 'Long Arbitrum / Short Legacy L1 Basket',
                side: 'PAIR',
                entry_price: '0.75',
                stop_loss: '0.60',
                take_profit: '2.00',
                rationale: 'Arbitrum leading on-chain finance while legacy L1s struggle for relevance.',
                metadata: JSON.stringify({
                    specifications: [
                        { label: 'Asset', long: 'Arbitrum (ARB)', short: 'Legacy L1 Basket: 33% SOL, 33% ADA, 34% DOT' },
                        { label: 'Entry Price', long: 'ARB @ $0.75', short: 'SOL @ $145, ADA @ $0.90, DOT @ $7.20' },
                        { label: 'Position Size', long: '$50,000 (66,667 ARB)', short: 'SOL: $16.5k, ADA: $16.5k, DOT: $17k' },
                        { label: 'Stop Loss', long: '$0.60 (-20%)', short: 'SOL @ $181, ADA @ $1.13, DOT @ $9.00' },
                        { label: 'Take Profit 1', long: '$1.20 (+60%)', short: 'SOL @ $123, ADA @ $0.77, DOT @ $6.12' },
                        { label: 'Take Profit 2', long: '$2.00 (+167%)', short: 'SOL @ $87, ADA @ $0.54, DOT @ $4.32' },
                    ],
                    quotes: [
                        { category: 'Institutional Preference', text: '"Institutional players are looking at Base and Arbitrum as the primary venues for on-chain finance."' },
                        { category: 'Modular Thesis', text: '"The modular blockchain thesis is the most significant evolution in crypto architecture since the launch of Ethereum."' }
                    ]
                }),
                status: 'ACTIVE'
            },
            {
                id: 'pair-3',
                symbol: 'TIA / ETH',
                title: 'Long Celestia / Short Ethereum',
                side: 'PAIR',
                entry_price: '5.50',
                stop_loss: '4.00',
                take_profit: '25.00',
                rationale: 'Modular data availability specialization outperforming general-purpose L1s.',
                metadata: JSON.stringify({
                    specifications: [
                        { label: 'Asset', long: 'Celestia (TIA)', short: 'Ethereum (ETH)' },
                        { label: 'Entry Price', long: 'TIA @ $5.50', short: 'ETH @ $2,600' },
                        { label: 'Position Size', long: '$50,000 (9,091 TIA)', short: '$50,000 (19.23 ETH)' },
                        { label: 'Stop Loss', long: '$4.00 (-27%)', short: 'ETH @ $3,380 (+30%)' },
                        { label: 'Take Profit 1', long: '$12.00 (+118%)', short: 'ETH @ $2,080 (-20%)' },
                        { label: 'Take Profit 2', long: '$25.00 (+355%)', short: 'ETH @ $1,300 (-50%)' }
                    ],
                    quotes: [
                        { category: 'Modular Infrastructure', text: '"Celestia is the first modular data availability network... specialization allows it to be extremely efficient."' },
                        { category: 'Specialized vs General', text: '"This is the difference between a general practitioner and a team of specialists. The results speak for themselves."' }
                    ]
                }),
                status: 'ACTIVE'
            },
            {
                id: 'tactical-short',
                symbol: 'BTC / USD',
                title: 'Tactical Short - BTC @ $106K Retest',
                side: 'SHORT',
                entry_price: '106,000',
                stop_loss: '110,000',
                take_profit: '92,000',
                rationale: 'Predictable Q4 top breakdown pattern requiring a retest of the 200 daily MA.',
                metadata: JSON.stringify({
                    specifications: [
                        { label: 'Entry Price', value: '$106,000 (200-day MA retest)' },
                        { label: 'Position Size', value: 'Conservative: 10-20% of portfolio' },
                        { label: 'Quantity Example', value: '0.5 BTC short ($53,000)' },
                        { label: 'Stop Loss', value: '$110,000 (+3.8%)' },
                        { label: 'Take Profit 1', value: '$98,000 (-7.5%)' },
                        { label: 'Take Profit 2', value: '$92,000 (-13.2%)' },
                        { label: 'Time Horizon', value: '2-6 months' }
                    ],
                    quotes: [
                        { category: '200-Day MA Pattern', text: '"When you break down, you test the 200 daily moving average... I\'m expecting within the next two, three, four weeks for Bitcoin to get to the 200 daily, which is sitting at 106."' },
                        { category: 'Bearish Setup', text: '"I\'m actually shorting at those price levels because... after getting that retest, prices always come to the downside."' }
                    ]
                }),
                status: 'ACTIVE'
            },
            {
                id: 'pair-4',
                symbol: 'SOL / BTC',
                title: 'Long Solana / Short Bitcoin',
                side: 'PAIR',
                entry_price: '145',
                stop_loss: '116',
                take_profit: '290',
                rationale: 'Technical rejection of BTC at 200-day MA combined with expected altcoin outperformance during mid-cycle consolidation.',
                metadata: JSON.stringify({
                    specifications: [
                        { label: 'Asset', long: 'Solana (SOL)', short: 'Bitcoin (BTC)' },
                        { label: 'Entry Price', long: 'SOL @ $145', short: 'BTC @ $106,000 (at 200-day MA retest)' },
                        { label: 'Position Size', long: '$50,000 in SOL (345 SOL)', short: '$50,000 in BTC (0.472 BTC)' },
                        { label: 'Stop Loss', long: '$116 (-20%)', short: 'BTC @ $110,000 (+3.8%)' },
                        { label: 'Take Profit 1', long: '$203 (+40%)', short: 'BTC @ $98,000 (-7.5%)' },
                        { label: 'Take Profit 2', long: '$290 (+100%)', short: 'BTC @ $92,000 (-13.2%)' },
                        { label: 'Time Horizon', long: '3-9 months', short: '3-9 months' }
                    ],
                    quotes: [
                        { category: 'Short BTC - Technical Weakness', text: '"I\'m expecting within the next two, three, four weeks for Bitcoin to get to the 200 daily, which is sitting at 106... I\'m actually shorting at those price levels."' },
                        { category: 'Long SOL - Consolidation thesis', text: '"A lot of people compare this cycle to 2019... altcoins actually outperformed BTC during the consolidation phase before the real bear market began."' },
                        { category: 'Liquidity Benefits', text: '"In 2019... money printing led to a consolidation in markets and then a dramatic move to the upside... travel back into the riskcon and Bitcoin markets."' }
                    ]
                }),
                status: 'ACTIVE'
            }
        ];

        const ideaStmt = db.prepare('INSERT INTO trade_ideas (id, symbol, title, side, entry_price, stop_loss, take_profit, rationale, metadata, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        tradeIdeas.forEach(t => ideaStmt.run(t.id, t.symbol, t.title, t.side, t.entry_price, t.stop_loss, t.take_profit, t.rationale, t.metadata, t.status));
        ideaStmt.finalize();

        console.log('Seed process completed successfully.');
        console.log('- trade_ideas table seeded with rich pair trades.');
        console.log('- final_trades table left empty.');

    } catch (err) {
        console.error('Seed process failed:', err);
    } finally {
        db.close();
    }
}

seed();
