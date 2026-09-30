function Dashboard({ user, portfolioSummary, stocks, marketSummary, onSelectStock, onOpenTrade }) {
  const summary = portfolioSummary || {
    netWorth: user ? user.virtualBalance : 100000,
    cashBalance: user ? user.virtualBalance : 100000,
    totalHoldingsValue: 0,
    totalReturnDollars: 0,
    totalReturnPercent: 0,
    todayUnrealizedPnL: 0
  };

  const isReturnPos = summary.totalReturnDollars >= 0;
  const isTodayPos = summary.todayUnrealizedPnL >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Greeting */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>
          Trading Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Welcome back, <strong style={{ color: '#fff' }}>{user ? user.name : 'Trader'}</strong>! Monitor your paper portfolio performance and execute real-time trades.
        </p>
      </div>

      {/* Summary Performance Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <span className="stat-title">Total Net Worth</span>
          <span className="stat-value">
            ${summary.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`stat-sub ${isReturnPos ? 'text-emerald' : 'text-ruby'}`}>
            <i className={`fa-solid fa-arrow-trend-${isReturnPos ? 'up' : 'down'}`}></i>
            {isReturnPos ? '+' : ''}${summary.totalReturnDollars.toFixed(2)} ({summary.totalReturnPercent.toFixed(2)}%)
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-title">Buying Power (Cash)</span>
          <span className="stat-value" style={{ color: 'var(--cyan)' }}>
            ${summary.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="stat-sub" style={{ color: 'var(--text-muted)' }}>
            Virtual Funds Available
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-title">Invested Holdings</span>
          <span className="stat-value">
            ${summary.totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="stat-sub" style={{ color: 'var(--text-muted)' }}>
            Active Stock Value
          </span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-title">Today's P&L</span>
          <span className={`stat-value ${isTodayPos ? 'text-emerald' : 'text-ruby'}`}>
            {isTodayPos ? '+' : ''}${summary.todayUnrealizedPnL.toFixed(2)}
          </span>
          <span className={`stat-sub ${isTodayPos ? 'text-emerald' : 'text-ruby'}`}>
            Unrealized Day Change
          </span>
        </div>
      </div>

      {/* Top Movers Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Top Gainers */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-fire text-emerald"></i> Top Gainers Today
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(marketSummary.topGainers || []).slice(0, 4).map(s => (
              <div 
                key={s.symbol}
                onClick={() => onSelectStock(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify-content: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="symbol-badge">{s.symbol}</span>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>${s.currentPrice.toFixed(2)}</div>
                  <div className="text-emerald" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    +{s.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-arrow-trend-down text-ruby"></i> Top Market Losers
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(marketSummary.topLosers || []).slice(0, 4).map(s => (
              <div 
                key={s.symbol}
                onClick={() => onSelectStock(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify-content: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="symbol-badge" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>{s.symbol}</span>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>${s.currentPrice.toFixed(2)}</div>
                  <div className="text-ruby" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {s.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
