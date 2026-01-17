const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const mockContent = [
    {
        id: "1",
        type: "twitter",
        title: "L2s are draining liquidity from Alt L1s",
        excerpt: "The rotation is happening faster than most realize. Ethereum's L2 ecosystem is becoming the de facto destination for DeFi activity...",
        source: "x.com",
        author: "@cryptoanalyst",
        date: "2h ago",
        readTime: "2 mins",
        tags: JSON.stringify(["ethereum", "l2", "solana"]),
        hasNarrative: 1,
        narrative: JSON.stringify({
            summary: "thesis suggests ethereum l2s are capturing market share from alternative layer 1 chains. the narrative indicates a structural shift in liquidity flows favoring the ethereum ecosystem.",
        }),
        url: "https://x.com/cryptoanalyst/status/1",
        full_content: "L2s are systematically draining liquidity from alt L1s. The rotation is happening faster than most realize.\n\nEthereum's L2 ecosystem is becoming the de facto destination for DeFi activity. Alt L1s are losing TVL at an accelerating rate.\n\nETH ecosystem dominance will only accelerate as bridging costs decrease and L2 UX improves. We're seeing a fundamental shift in where capital settles.\n\nInstitutional players are looking at Base and Arbitrum as the primary venues for on-chain finance, leaving legacy chains struggling to maintain relevance.",
        extra_info: JSON.stringify({ thread_id: "1" })
    },
    {
        id: "2",
        type: "youtube",
        title: "Why Bitcoin Dominance Will Hit 70% This Cycle",
        excerpt: "In this analysis, we break down the macro factors driving Bitcoin's dominance higher. Institutional preference for BTC continues to grow...",
        source: "youtube.com",
        author: "Coin Bureau",
        date: "1d ago",
        readTime: "18 mins",
        tags: JSON.stringify(["bitcoin", "macro", "dominance"]),
        thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200&h=150&fit=crop",
        hasNarrative: 1,
        narrative: JSON.stringify({
            summary: "macro analysis suggests bitcoin will outperform altcoins as institutional preference and risk-off sentiment drives capital rotation into btc.",
        }),
        url: "https://www.youtube.com/watch?v=2",
        full_content: "Bitcoin dominance is one of the most important metrics to watch this cycle. We've seen a clear trend of capital concentrating in the king of crypto.\n\nInstitutional investors aren't looking for the next moonshot altcoin; they're looking for a digital gold alternative. BlackRock, Fidelity, and others are funneling billions into BTC ETFs.\n\nMeanwhile, the altcoin market is fragmented. There's too much supply and not enough demand to sustain thousands of projects. This leads to a massive shakeout where only the strongest survive.\n\nHistorically, BTC dominance peaks late in the cycle after a period of macro uncertainty. We are currently in that window. Expect BTC to capture up to 70% of total market cap before a true altseason begins.",
        extra_info: JSON.stringify({ video_id: "2" })
    },
    {
        id: "3",
        type: "article",
        title: "The Modular Blockchain Thesis: Why Celestia Changes Everything",
        excerpt: "A deep dive into the modular blockchain architecture and why data availability layers like Celestia represent a paradigm shift in scaling...",
        source: "bankless.com",
        author: "David Hoffman",
        date: "3d ago",
        readTime: "12 mins",
        tags: JSON.stringify(["celestia", "modular", "da"]),
        hasNarrative: 1,
        narrative: JSON.stringify({
            summary: "the modular thesis positions celestia as infrastructure for next-gen rollups. this represents a bet on the modular vs monolithic blockchain debate.",
        }),
        url: "https://bankless.com/modular-thesis",
        full_content: "The modular blockchain thesis is the most significant evolution in crypto architecture since the launch of Ethereum. By decoupling the layers of a blockchain—execution, settlement, consensus, and data availability—we can achieve scale that was previously impossible.\n\nCelestia is the first modular data availability network. It doesn't handle smart contracts; it just ensures that data is available for rollups to use. This simple specialization allows it to be extremely efficient.\n\nIn a monolithic world, every node does everything. In a modular world, we have specialized layers. This is the difference between a general practitioner and a team of specialists. The results speak for themselves: higher throughput and lower costs for users.\n\nAs we move into 2024, the modular ecosystem is exploding. From rollups to sovereign chains, everything is being built on top of modular infrastructure. This is not just a trend; it's the inevitable endgame for blockchain scaling.",
        extra_info: JSON.stringify({})
    }
];


db.serialize(() => {
    db.run("DROP TABLE IF EXISTS content");
    db.run(`CREATE TABLE content (
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

    const stmt = db.prepare("INSERT INTO content (id, type, title, excerpt, source, author, date, readTime, tags, thumbnail, hasNarrative, narrative, url, full_content, extra_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    mockContent.forEach(item => {
        stmt.run(
            item.id,
            item.type,
            item.title,
            item.excerpt,
            item.source,
            item.author,
            item.date,
            item.readTime,
            item.tags,
            item.thumbnail || null,
            item.hasNarrative,
            item.narrative,
            item.url,
            item.full_content,
            item.extra_info
        );
    });
    stmt.finalize();
    console.log("Database seeded successfully!");
});

db.close();

