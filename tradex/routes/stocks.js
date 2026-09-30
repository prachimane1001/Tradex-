const db = require('../db/database');

function handleGetStocks(req, res) {
  const { search, sector } = req.query || {};
  let stocks = db.find('stocks');

  if (search) {
    const q = search.toLowerCase().trim();
    stocks = stocks.filter(s =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }

  if (sector && sector !== 'ALL') {
    stocks = stocks.filter(s => s.sector.toUpperCase() === sector.toUpperCase());
  }

  res.statusCode = 200;
  res.json({
    success: true,
    count: stocks.length,
    stocks
  });
}

function handleMarketSummary(req, res) {
  const stocks = db.find('stocks');
  if (!stocks || stocks.length === 0) {
    res.statusCode = 200;
    return res.json({ success: true, topGainers: [], topLosers: [], mostActive: [] });
  }

  const sortedByChange = [...stocks].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
  const sortedByVolume = [...stocks].sort((a, b) => (b.volume || 0) - (a.volume || 0));

  res.statusCode = 200;
  res.json({
    success: true,
    topGainers: sortedByChange.slice(0, 4),
    topLosers: sortedByChange.slice(-4).reverse(),
    mostActive: sortedByVolume.slice(0, 4)
  });
}

function handleGetStockDetail(req, res, symbol) {
  const stockSymbol = symbol.toUpperCase().trim();
  const stock = db.findOne('stocks', { symbol: stockSymbol });

  if (!stock) {
    res.statusCode = 404;
    return res.json({ success: false, message: `Stock symbol '${stockSymbol}' not found.` });
  }

  res.statusCode = 200;
  res.json({
    success: true,
    stock
  });
}

module.exports = {
  handleGetStocks,
  handleMarketSummary,
  handleGetStockDetail
};
