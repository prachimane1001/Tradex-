const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

function handleGetWatchlist(req, res) {
  authenticate(req, res, () => {
    const items = db.find('watchlists', { userId: req.user.id });
    const stocks = db.find('stocks');
    const stockMap = new Map(stocks.map(s => [s.symbol, s]));

    const watchlist = items.map(item => {
      const stock = stockMap.get(item.symbol);
      return {
        id: item._id,
        symbol: item.symbol,
        addedAt: item.createdAt,
        stock: stock || null
      };
    }).filter(item => item.stock !== null);

    res.statusCode = 200;
    res.json({
      success: true,
      count: watchlist.length,
      watchlist
    });
  });
}

function handleAddWatchlist(req, res) {
  authenticate(req, res, () => {
    const { symbol } = req.body || {};
    if (!symbol) {
      res.statusCode = 400;
      return res.json({ success: false, message: 'Stock symbol required.' });
    }

    const stockSymbol = symbol.toUpperCase().trim();
    const stock = db.findOne('stocks', { symbol: stockSymbol });

    if (!stock) {
      res.statusCode = 404;
      return res.json({ success: false, message: `Stock '${stockSymbol}' not found.` });
    }

    const existing = db.findOne('watchlists', { userId: req.user.id, symbol: stockSymbol });
    if (existing) {
      res.statusCode = 400;
      return res.json({ success: false, message: `${stockSymbol} is already in your watchlist.` });
    }

    const item = db.insertOne('watchlists', {
      userId: req.user.id,
      symbol: stockSymbol
    });

    res.statusCode = 201;
    res.json({
      success: true,
      message: `Added ${stockSymbol} to watchlist.`,
      item
    });
  });
}

function handleRemoveWatchlist(req, res, symbol) {
  authenticate(req, res, () => {
    const stockSymbol = symbol.toUpperCase().trim();
    const deleted = db.deleteOne('watchlists', { userId: req.user.id, symbol: stockSymbol });

    if (!deleted) {
      res.statusCode = 404;
      return res.json({ success: false, message: `${stockSymbol} not found in your watchlist.` });
    }

    res.statusCode = 200;
    res.json({
      success: true,
      message: `Removed ${stockSymbol} from watchlist.`
    });
  });
}

module.exports = {
  handleGetWatchlist,
  handleAddWatchlist,
  handleRemoveWatchlist
};
