const db = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const marketSimulator = require('../utils/marketSimulator');

function runAdmin(req, res, callback) {
  authenticate(req, res, () => {
    requireRole('admin')(req, res, () => {
      callback();
    });
  });
}

function handleSystemStats(req, res) {
  runAdmin(req, res, () => {
    const users = db.find('users');
    const stocks = db.find('stocks');
    const transactions = db.find('transactions');
    const portfolios = db.find('portfolios');

    let totalTradeVolume = 0;
    transactions.forEach(t => totalTradeVolume += (t.totalAmount || 0));

    res.statusCode = 200;
    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalStocks: stocks.length,
        activeTradingStocks: stocks.filter(s => s.isTradingActive).length,
        totalTransactions: transactions.length,
        totalTradeVolume: parseFloat(totalTradeVolume.toFixed(2)),
        activeHoldingsCount: portfolios.length
      }
    });
  });
}

function handleAddStock(req, res) {
  runAdmin(req, res, () => {
    const { symbol, name, sector, price, peRatio, marketCap } = req.body || {};

    if (!symbol || !name || !price) {
      res.statusCode = 400;
      return res.json({ success: false, message: 'Symbol, name, and current price are required.' });
    }

    const stockSymbol = symbol.toUpperCase().trim();
    const existing = db.findOne('stocks', { symbol: stockSymbol });

    if (existing) {
      res.statusCode = 400;
      return res.json({ success: false, message: `Stock '${stockSymbol}' already exists.` });
    }

    const basePrice = parseFloat(price);
    const history = marketSimulator.generateHistoricalData(basePrice, 30);

    const newStock = db.insertOne('stocks', {
      symbol: stockSymbol,
      name: name.trim(),
      sector: sector ? sector.trim() : 'General',
      currentPrice: basePrice,
      previousClose: basePrice,
      change: 0.00,
      changePercent: 0.00,
      dayHigh: basePrice,
      dayLow: basePrice,
      volume: 1000000,
      peRatio: parseFloat(peRatio) || 20.0,
      marketCap: marketCap || '1B',
      isTradingActive: true,
      history
    });

    res.statusCode = 201;
    res.json({
      success: true,
      message: `Successfully listed ${newStock.symbol} (${newStock.name}) on TradeX.`,
      stock: newStock
    });
  });
}

function handleUpdateStock(req, res, symbol) {
  runAdmin(req, res, () => {
    const stockSymbol = symbol.toUpperCase().trim();
    const stock = db.findOne('stocks', { symbol: stockSymbol });

    if (!stock) {
      res.statusCode = 404;
      return res.json({ success: false, message: `Stock '${stockSymbol}' not found.` });
    }

    const { name, sector, price, peRatio, marketCap } = req.body || {};
    const updates = {};

    if (name) updates.name = name.trim();
    if (sector) updates.sector = sector.trim();
    if (price !== undefined && !isNaN(price)) updates.currentPrice = parseFloat(price);
    if (peRatio !== undefined) updates.peRatio = parseFloat(peRatio);
    if (marketCap) updates.marketCap = marketCap.trim();

    const updatedStock = db.updateOne('stocks', { symbol: stockSymbol }, updates);

    res.statusCode = 200;
    res.json({
      success: true,
      message: `Stock ${stockSymbol} updated successfully.`,
      stock: updatedStock
    });
  });
}

function handleToggleStatus(req, res, symbol) {
  runAdmin(req, res, () => {
    const stockSymbol = symbol.toUpperCase().trim();
    const stock = db.findOne('stocks', { symbol: stockSymbol });

    if (!stock) {
      res.statusCode = 404;
      return res.json({ success: false, message: `Stock '${stockSymbol}' not found.` });
    }

    const newStatus = !stock.isTradingActive;
    const updated = db.updateOne('stocks', { symbol: stockSymbol }, { isTradingActive: newStatus });

    res.statusCode = 200;
    res.json({
      success: true,
      message: `Trading for ${stockSymbol} is now ${newStatus ? 'ACTIVE' : 'SUSPENDED'}.`,
      isTradingActive: newStatus,
      stock: updated
    });
  });
}

function handleDeleteStock(req, res, symbol) {
  runAdmin(req, res, () => {
    const stockSymbol = symbol.toUpperCase().trim();
    const deleted = db.deleteOne('stocks', { symbol: stockSymbol });

    if (!deleted) {
      res.statusCode = 404;
      return res.json({ success: false, message: `Stock '${stockSymbol}' not found.` });
    }

    res.statusCode = 200;
    res.json({
      success: true,
      message: `Stock ${stockSymbol} has been deleted from TradeX.`
    });
  });
}

module.exports = {
  handleSystemStats,
  handleAddStock,
  handleUpdateStock,
  handleToggleStatus,
  handleDeleteStock
};
