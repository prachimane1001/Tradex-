const db = require('../db/database');

class MarketSimulator {
  constructor() {
    this.listeners = [];
    this.intervalId = null;
    this.tickRateMs = 3000; // Update market prices every 3 seconds
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.tickRateMs);

    console.log('📈 Stock Market Real-Time Price Simulator active (3s updates)');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  tick() {
    const stocks = db.find('stocks');
    if (!stocks || stocks.length === 0) return;

    const updatedStocks = [];

    stocks.forEach(stock => {
      if (!stock.isTradingActive) return;

      // Realistic random walk (volatility: 0.2% - 1.2% per tick)
      const volatility = (Math.random() * 0.01) + 0.002;
      const direction = Math.random() > 0.49 ? 1 : -1;
      const priceDelta = stock.currentPrice * volatility * direction;

      let newPrice = Math.max(1.00, parseFloat((stock.currentPrice + priceDelta).toFixed(2)));
      const change = parseFloat((newPrice - stock.previousClose).toFixed(2));
      const changePercent = parseFloat(((change / stock.previousClose) * 100).toFixed(2));

      const dayHigh = Math.max(stock.dayHigh || newPrice, newPrice);
      const dayLow = Math.min(stock.dayLow || newPrice, newPrice);
      const volumeAdd = Math.floor(Math.random() * 2500) + 100;
      const volume = (stock.volume || 1000000) + volumeAdd;

      // Append new price to historical price array
      const history = stock.history || [];
      const timestamp = new Date().toISOString();
      if (history.length > 500) history.shift(); // keep max 500 data points
      history.push({ price: newPrice, timestamp });

      const updated = db.updateOne('stocks', { symbol: stock.symbol }, {
        currentPrice: newPrice,
        change,
        changePercent,
        dayHigh,
        dayLow,
        volume,
        history
      });

      if (updated) {
        updatedStocks.push(updated);
      }
    });

    if (updatedStocks.length > 0) {
      // Notify real-time listeners
      this.listeners.forEach(cb => cb(updatedStocks));
    }
  }

  /**
   * Helper to generate initial historical price trend points for newly created stock
   */
  generateHistoricalData(basePrice, days = 30) {
    const history = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    let currentPrice = basePrice * 0.85; // start 15% lower 30 days ago

    for (let i = days; i >= 0; i--) {
      const timestamp = new Date(now - (i * dayMs)).toISOString();
      const changePercent = (Math.random() - 0.48) * 0.04;
      currentPrice = Math.max(1.00, parseFloat((currentPrice * (1 + changePercent)).toFixed(2)));
      history.push({ price: currentPrice, timestamp });
    }

    return history;
  }
}

module.exports = new MarketSimulator();
