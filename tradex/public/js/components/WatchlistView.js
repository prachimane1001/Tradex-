function WatchlistView({ watchlist, stocks, onSelectStock, onOpenTrade, onToggleWatchlist }) {
  const stockMap = new Map((stocks || []).map(s => [s.symbol, s]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>
          Favorite Stock Watchlist
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Keep an eye on stocks you're interested in trading and track real-time price triggers.
        </p>
      </div>

      <div className="glass-card table-container">
        {(!watchlist || watchlist.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <i className="fa-regular fa-star" style={{ fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '1rem' }}></i>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Watchlist is Empty</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Click the star icon next to any stock in the market directory to add it here.</p>
          </div>
        ) : (
          <table className="tradex-table">
            <thead>
              <tr>
                <th>Stock Symbol & Company</th>
                <th>Sector</th>
                <th>Current Price</th>
                <th>24h Change</th>
                <th>24h Volume</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(item => {
                const stock = stockMap.get(item.symbol) || item.stock || {};
                const isUp = (stock.changePercent || 0) >= 0;
                return (
                  <tr key={item.symbol}>
                    <td onClick={() => onSelectStock(stock)} style={{ cursor: 'pointer' }}>
                      <div className="stock-pill">
                        <span className="symbol-badge">{item.symbol}</span>
                        <span style={{ fontWeight: 600 }}>{stock.name}</span>
                      </div>
                    </td>
                    <td>{stock.sector}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                        ${stock.currentPrice ? stock.currentPrice.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td>
                      <span className={isUp ? 'text-emerald' : 'text-ruby'} style={{ fontWeight: 700 }}>
                        {isUp ? '+' : ''}${stock.change ? stock.change.toFixed(2) : '0.00'} ({stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%)
                      </span>
                    </td>
                    <td>{(stock.volume || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-emerald" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => onOpenTrade(stock, 'BUY')}>Buy</button>
                        <button className="btn btn-ruby" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => onOpenTrade(stock, 'SELL')}>Sell</button>
                        <button className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--ruby)' }} onClick={() => onToggleWatchlist(item.symbol)}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

window.WatchlistView = WatchlistView;
