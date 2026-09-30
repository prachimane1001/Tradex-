const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

function handleBuy(req, res) {
  authenticate(req, res, () => {
    const { symbol, quantity } = req.body || {};
    const numQuantity = parseInt(quantity, 10);

    if (!symbol || isNaN(numQuantity) || numQuantity <= 0) {
      res.statusCode = 400;
      return res.json({ success: false, message: 'Please specify a valid stock symbol and positive share quantity.' });
    }

    const stockSymbol = symbol.toUpperCase().trim();
    const stock = db.findOne('stocks', { symbol: stockSymbol });

    if (!stock) {
      res.statusCode = 404;
      return res.json({ success: false, message: `Stock '${stockSymbol}' not found.` });
    }

    if (!stock.isTradingActive) {
      res.statusCode = 400;
      return res.json({ success: false, message: `Trading is currently suspended for ${stock.name} (${stockSymbol}).` });
    }

    const user = db.findOne('users', { _id: req.user.id });
    const totalCost = parseFloat((stock.currentPrice * numQuantity).toFixed(2));

    if (user.virtualBalance < totalCost) {
      res.statusCode = 400;
      return res.json({
        success: false,
        message: `Insufficient virtual funds. Total cost: $${totalCost.toLocaleString()}, Available: $${user.virtualBalance.toLocaleString()}`
      });
    }

    // 1. Deduct funds from user balance
    const newBalance = parseFloat((user.virtualBalance - totalCost).toFixed(2));
    db.updateOne('users', { _id: user._id }, { virtualBalance: newBalance });

    // 2. Update or insert portfolio holding
    let holding = db.findOne('portfolios', { userId: user._id, symbol: stockSymbol });
    if (holding) {
      const updatedQty = holding.quantity + numQuantity;
      const updatedTotalInvested = parseFloat((holding.totalInvested + totalCost).toFixed(2));
      const newAvgPrice = parseFloat((updatedTotalInvested / updatedQty).toFixed(2));

      db.updateOne('portfolios', { _id: holding._id }, {
        quantity: updatedQty,
        averageBuyPrice: newAvgPrice,
        totalInvested: updatedTotalInvested
      });
    } else {
      db.insertOne('portfolios', {
        userId: user._id,
        symbol: stockSymbol,
        quantity: numQuantity,
        averageBuyPrice: stock.currentPrice,
        totalInvested: totalCost
      });
    }

    // 3. Record transaction log
    const transaction = db.insertOne('transactions', {
      userId: user._id,
      symbol: stockSymbol,
      type: 'BUY',
      quantity: numQuantity,
      pricePerShare: stock.currentPrice,
      totalAmount: totalCost,
      timestamp: new Date().toISOString()
    });

    res.statusCode = 200;
    res.json({
      success: true,
      message: `Successfully bought ${numQuantity} shares of ${stockSymbol} @ $${stock.currentPrice.toFixed(2)}`,
      transaction,
      newBalance
    });
  });
}

function handleSell(req, res) {
  authenticate(req, res, () => {
    const { symbol, quantity } = req.body || {};
    const numQuantity = parseInt(quantity, 10);

    if (!symbol || isNaN(numQuantity) || numQuantity <= 0) {
      res.statusCode = 400;
      return res.json({ success: false, message: 'Please specify a valid stock symbol and positive share quantity.' });
    }

    const stockSymbol = symbol.toUpperCase().trim();
    const stock = db.findOne('stocks', { symbol: stockSymbol });

    if (!stock) {
      res.statusCode = 404;
      return res.json({ success: false, message: `Stock '${stockSymbol}' not found.` });
    }

    const user = db.findOne('users', { _id: req.user.id });
    const holding = db.findOne('portfolios', { userId: user._id, symbol: stockSymbol });

    if (!holding || holding.quantity < numQuantity) {
      const ownedQty = holding ? holding.quantity : 0;
      res.statusCode = 400;
      return res.json({
        success: false,
        message: `You do not own enough shares of ${stockSymbol}. Owned: ${ownedQty}, Attempted sell: ${numQuantity}`
      });
    }

    const totalProceeds = parseFloat((stock.currentPrice * numQuantity).toFixed(2));
    const newBalance = parseFloat((user.virtualBalance + totalProceeds).toFixed(2));

    // 1. Credit funds to user balance
    db.updateOne('users', { _id: user._id }, { virtualBalance: newBalance });

    // 2. Update holding
    if (holding.quantity === numQuantity) {
      db.deleteOne('portfolios', { _id: holding._id });
    } else {
      const remainingQty = holding.quantity - numQuantity;
      const remainingInvested = parseFloat((holding.averageBuyPrice * remainingQty).toFixed(2));
      db.updateOne('portfolios', { _id: holding._id }, {
        quantity: remainingQty,
        totalInvested: remainingInvested
      });
    }

    // 3. Record transaction log
    const transaction = db.insertOne('transactions', {
      userId: user._id,
      symbol: stockSymbol,
      type: 'SELL',
      quantity: numQuantity,
      pricePerShare: stock.currentPrice,
      totalAmount: totalProceeds,
      timestamp: new Date().toISOString()
    });

    res.statusCode = 200;
    res.json({
      success: true,
      message: `Successfully sold ${numQuantity} shares of ${stockSymbol} @ $${stock.currentPrice.toFixed(2)}`,
      transaction,
      newBalance
    });
  });
}

function handleHistory(req, res) {
  authenticate(req, res, () => {
    const transactions = db.find('transactions', { userId: req.user.id });
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.statusCode = 200;
    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  });
}

module.exports = {
  handleBuy,
  handleSell,
  handleHistory
};
