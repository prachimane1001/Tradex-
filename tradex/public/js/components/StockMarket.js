function StockMarket({ stocks, watchlist, onSelectStock, onOpenTrade, onToggleWatchlist }) {
  const [search, setSearch] = React.useState('');
  const [selectedSector, setSelectedSector] = React.useState('ALL');

  const sectors = ['ALL', 'Technology', 'Consumer Cyclical', 'Communication Services', 'ETF Index', 'Financial Services'];

  const watchlistSymbolSet = new Set((watchlist || []).map(w => w.symbol));

  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
                          s.name.toLowerCase().includes(search.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || s.sector.toUpperCase() === selectedSector.toUpperCase();
    return matchesSearch && matchesSector;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>
          US Stock Market Directory
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Explore real-time US stock prices, historical trends, and execute virtual market orders.
        </p>
      </div>

      {/* Search Bar & Sector Filters */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}></i>
          <input 
            type="text"
            className="input-glass"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search stock by symbol or company name (e.g. AAPL, NVDA)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {sectors.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`btn ${selectedSector === sec ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="glass-card table-container">
        <table className="tradex-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Symbol & Name</th>
              <th>Sector</th>
              <th>Current Price</th>
              <th>24h Change</th>
              <th>24h Range (Low - High)</th>
              <th>Volume</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map(s => {
              const isUp = (s.changePercent || 0) >= 0;
              const isWatchlisted = watchlistSymbolSet.has(s.symbol);
              return (
                <tr key={s.symbol}>
                  <td>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggleWatchlist(s.symbol); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isWatchlisted ? 'var(--amber)' : 'var(--text-dim)' }}
                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <i className={`fa-${isWatchlisted ? 'solid' : 'regular'} fa-star`}></i>
                    </button>
                  </td>
                  <td 
                    onClick={() => onSelectStock(s)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stock-pill">
                      <span className="symbol-badge">{s.symbol}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        {!s.isTradingActive && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 600 }}>[TRADING HALTED]</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.sector}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                      ${s.currentPrice ? s.currentPrice.toFixed(2) : '0.00'}
                    </span>
                  </td>
                  <td>
                    <span className={isUp ? 'text-emerald' : 'text-ruby'} style={{ fontWeight: 700 }}>
                      {isUp ? '+' : ''}${s.change ? s.change.toFixed(2) : '0.00'} ({s.changePercent ? s.changePercent.toFixed(2) : '0.00'}%)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      ${s.dayLow ? s.dayLow.toFixed(2) : '0'} - ${s.dayHigh ? s.dayHigh.toFixed(2) : '0'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      {(s.volume || 0).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-emerald" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => onOpenTrade(s, 'BUY')}
                        disabled={!s.isTradingActive}
                      >
                        Buy
                      </button>
                      <button 
                        className="btn btn-ruby" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => onOpenTrade(s, 'SELL')}
                        disabled={!s.isTradingActive}
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.StockMarket = StockMarket;
