function PortfolioView({ portfolio, summary, stocks, onSelectStock, onOpenTrade }) {
  const stockMap = new Map((stocks || []).map(s => [s.symbol, s]));
  const holdings = portfolio || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>
          Virtual Investment Portfolio
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your open stock positions, average buy prices, unrealized gains, and total return.
        </p>
      </div>

      {/* Holdings Table */}
      <div className="glass-card table-container">
        {holdings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '1rem' }}></i>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>No Active Holdings</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You currently have no open stock positions in your portfolio.</p>
            <button className="btn btn-primary" onClick={() => window.setActiveTab('market')}>
              <i className="fa-solid fa-magnifying-glass"></i> Explore US Stocks
            </button>
          </div>
        ) : (
          <table className="tradex-table">
            <thead>
              <tr>
                <th>Holding Symbol & Name</th>
                <th>Quantity</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Total Invested</th>
                <th>Current Value</th>
                <th>Unrealized Return</th>
                <th style={{ textAlign: 'right' }}>Trade Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const stock = stockMap.get(h.symbol) || {};
                const isGain = h.totalGainLoss >= 0;
                return (
                  <tr key={h.symbol}>
                    <td 
                      onClick={() => onSelectStock(stock)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="stock-pill">
                        <span className="symbol-badge">{h.symbol}</span>
                        <span style={{ fontWeight: 600 }}>{h.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{h.quantity} shares</span>
                    </td>
                    <td>${h.averageBuyPrice ? h.averageBuyPrice.toFixed(2) : '0.00'}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        ${h.currentPrice ? h.currentPrice.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td>${h.totalInvested ? h.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        ${h.currentValue ? h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </span>
                    </td>
                    <td>
                      <span className={isGain ? 'text-emerald' : 'text-ruby'} style={{ fontWeight: 700 }}>
                        {isGain ? '+' : ''}${h.totalGainLoss.toFixed(2)} ({h.totalGainLossPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-emerald" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => onOpenTrade(stock, 'BUY')}
                        >
                          Buy More
                        </button>
                        <button 
                          className="btn btn-ruby" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => onOpenTrade(stock, 'SELL')}
                        >
                          Sell Shares
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

window.PortfolioView = PortfolioView;
