const db = require('./database');
const { hashPassword } = require('../utils/security');
const marketSimulator = require('../utils/marketSimulator');

function seedDatabase() {
  console.log('🌱 Seeding TradeX database...');

  // 1. Seed Users (Demo trader & Admin manager)
  const existingUser = db.findOne('users', { email: 'user@tradex.com' });
  if (!existingUser) {
    db.insertOne('users', {
      name: 'Trader Demo',
      email: 'user@tradex.com',
      password: hashPassword('password123'),
      role: 'user',
      virtualBalance: 100000.00
    });
    console.log('  ✅ Created Demo User (user@tradex.com / password123)');
  }

  const existingAdmin = db.findOne('users', { email: 'admin@tradex.com' });
  if (!existingAdmin) {
    db.insertOne('users', {
      name: 'TradeX Admin',
      email: 'admin@tradex.com',
      password: hashPassword('admin123'),
      role: 'admin',
      virtualBalance: 1000000.00
    });
    console.log('  ✅ Created Admin User (admin@tradex.com / admin123)');
  }

  // 2. Seed Initial US Stock Market Listings
  const stockSeedData = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 232.50, peRatio: 33.4, marketCap: '3.55T' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', price: 128.20, peRatio: 45.2, marketCap: '3.12T' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', price: 448.90, peRatio: 36.8, marketCap: '3.33T' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', price: 186.40, peRatio: 42.1, marketCap: '1.94T' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', price: 179.80, peRatio: 26.5, marketCap: '2.21T' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services', price: 512.30, peRatio: 28.1, marketCap: '1.30T' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', price: 254.10, peRatio: 64.3, marketCap: '809B' },
    { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', price: 685.00, peRatio: 41.7, marketCap: '295B' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', price: 156.60, peRatio: 112.5, marketCap: '253B' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF Index', price: 564.30, peRatio: 25.1, marketCap: '560B' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', sector: 'ETF Index', price: 488.70, peRatio: 31.0, marketCap: '280B' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', price: 214.20, peRatio: 12.8, marketCap: '608B' }
  ];

  stockSeedData.forEach(s => {
    const existing = db.findOne('stocks', { symbol: s.symbol });
    if (!existing) {
      const history = marketSimulator.generateHistoricalData(s.price, 30);
      db.insertOne('stocks', {
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        currentPrice: s.price,
        previousClose: parseFloat((s.price * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)),
        change: 0.00,
        changePercent: 0.00,
        dayHigh: parseFloat((s.price * 1.015).toFixed(2)),
        dayLow: parseFloat((s.price * 0.985).toFixed(2)),
        volume: Math.floor(Math.random() * 20000000) + 5000000,
        peRatio: s.peRatio,
        marketCap: s.marketCap,
        isTradingActive: true,
        history
      });
    }
  });

  console.log('✅ Stock listings initialized.');
}

module.exports = seedDatabase;
