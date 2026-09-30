function StockDetail({ stock, onBack, onOpenTrade, onToggleWatchlist, isWatchlisted }) {
  const chartCanvasRef = React.useRef(null);

  React.useEffect(() => {
    if (stock && stock.history && window.ChartUtils) {
      const isPos = (stock.changePercent || 0) >= 0;
      window.ChartUtils.renderStockChart('stockDetailChartCanvas', stock.history, isPos);
    }
  }, [stock]);

  if (!stock) return null;

  const isUp = (stock.changePercent || 0) >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Button Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-outline" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Back to Market
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-outline"
            onClick={() => onToggleWatchlist(stock.symbol)}
          >
            <i className={`fa-${isWatchlisted ? 'solid' : 'regular'} fa-star ${isWatchlisted ? 'text-amber' : ''}`}></i>
            {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
          </button>
          <button className="btn btn-emerald" onClick={() => onOpenTrade(stock, 'BUY')}>
            <i className="fa-solid fa-cart-shopping"></i> Buy {stock.symbol}
          </button>
          <button className="btn btn-ruby" onClick={() => onOpenTrade(stock, 'SELL')}>
            <i className="fa-solid fa-hand-holding-dollar"></i> Sell {stock.symbol}
          </button>
        </div>
      </div>

      {/* Stock Overview Card */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="symbol-badge" style={{ fontSize: '1.1rem', padding: '0.4rem 0.8rem' }}>{stock.symbol}</span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800 }}>{stock.name}</h1>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sector: <strong>{stock.sector}</strong></span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800 }}>
            ${stock.currentPrice ? stock.currentPrice.toFixed(2) : '0.00'}
          </div>
          <div className={isUp ? 'text-emerald' : 'text-ruby'} style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <i className={`fa-solid fa-arrow-trend-${isUp ? 'up' : 'down'}`}></i>
            {isUp ? '+' : ''}${stock.change ? stock.change.toFixed(2) : '0.00'} ({stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%)
          </div>
        </div>
      </div>

      {/* Interactive Stock Price Chart */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)' }}>
            <i className="fa-solid fa-chart-candlestick text-cyan"></i> Price History & Live Trend
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Real-Time Stream Active (Updates every 3s)
          </span>
        </div>

        <div style={{ height: '350px', position: 'relative' }}>
          <canvas id="stockDetailChartCanvas" ref={chartCanvasRef}></canvas>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <span className="stat-title">24h Day Range</span>
          <span className="stat-value" style={{ fontSize: '1.3rem' }}>
            ${stock.dayLow ? stock.dayLow.toFixed(2) : '0'} - ${stock.dayHigh ? stock.dayHigh.toFixed(2) : '0'}
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-title">24h Volume</span>
          <span className="stat-value" style={{ fontSize: '1.3rem' }}>
            {(stock.volume || 0).toLocaleString()}
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-title">Market Cap</span>
          <span className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--cyan)' }}>
            {stock.marketCap || 'N/A'}
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-title">P/E Ratio</span>
          <span className="stat-value" style={{ fontSize: '1.3rem' }}>
            {stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

window.StockDetail = StockDetail;
