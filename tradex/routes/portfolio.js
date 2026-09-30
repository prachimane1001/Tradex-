const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

function handleGetPortfolio(req, res) {
  authenticate(req, res, () => {
    const user = db.findOne('users', { _id: req.user.id });
    if (!user) {
      res.statusCode = 404;
      return res.json({ success: false, message: 'User profile not found.' });
    }

    const rawHoldings = db.find('portfolios', { userId: req.user.id });
    const stocks = db.find('stocks');
    const stockMap = new Map(stocks.map(s => [s.symbol, s]));

    let totalHoldingsValue = 0;
    let totalInvestedCapital = 0;
    let todayUnrealizedPnL = 0;

    const holdings = rawHoldings.map(h => {
      const stock = stockMap.get(h.symbol) || {
        name: h.symbol,
        currentPrice: h.averageBuyPrice,
        change: 0,
        changePercent: 0
      };

      const currentValue = parseFloat((stock.currentPrice * h.quantity).toFixed(2));
      const invested = parseFloat((h.averageBuyPrice * h.quantity).toFixed(2));
      const totalGainLoss = parseFloat((currentValue - invested).toFixed(2));
      const totalGainLossPercent = invested > 0 ? parseFloat(((totalGainLoss / invested) * 100).toFixed(2)) : 0;
      const dayGainLoss = parseFloat((stock.change * h.quantity).toFixed(2));

      totalHoldingsValue += currentValue;
      totalInvestedCapital += invested;
      todayUnrealizedPnL += dayGainLoss;

      return {
        id: h._id,
        symbol: h.symbol,
        name: stock.name,
        quantity: h.quantity,
        averageBuyPrice: h.averageBuyPrice,
        currentPrice: stock.currentPrice,
        currentValue,
        totalInvested: invested,
        totalGainLoss,
        totalGainLossPercent,
        dayGainLoss,
        dayChangePercent: stock.changePercent || 0
      };
    });

    totalHoldingsValue = parseFloat(totalHoldingsValue.toFixed(2));
    totalInvestedCapital = parseFloat(totalInvestedCapital.toFixed(2));
    const cashBalance = user.virtualBalance;
    const netWorth = parseFloat((cashBalance + totalHoldingsValue).toFixed(2));
    const totalReturnDollars = parseFloat((totalHoldingsValue - totalInvestedCapital).toFixed(2));
    const totalReturnPercent = totalInvestedCapital > 0 ? parseFloat(((totalReturnDollars / totalInvestedCapital) * 100).toFixed(2)) : 0;

    res.statusCode = 200;
    res.json({
      success: true,
      summary: {
        netWorth,
        cashBalance,
        totalHoldingsValue,
        totalInvestedCapital,
        totalReturnDollars,
        totalReturnPercent,
        todayUnrealizedPnL: parseFloat(todayUnrealizedPnL.toFixed(2))
      },
      holdings
    });
  });
}

module.exports = {
  handleGetPortfolio
};
