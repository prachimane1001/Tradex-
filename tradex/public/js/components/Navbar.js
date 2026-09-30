function Navbar({ user, stocks, onOpenAuth, onLogout }) {
  return (
    <nav className="navbar">
      <a href="#" className="navbar-brand">
        <i className="fa-solid fa-chart-line-up"></i>
        <span>TradeX</span>
      </a>

      {/* Live Market Ticker Tape */}
      <div className="ticker-tape">
        {stocks.slice(0, 6).map(s => {
          const isUp = (s.changePercent || 0) >= 0;
          return (
            <div key={s.symbol} className="ticker-item">
              <span style={{ fontWeight: 700 }}>{s.symbol}</span>
              <span>${s.currentPrice ? s.currentPrice.toFixed(2) : '0.00'}</span>
              <span className={isUp ? 'text-emerald' : 'text-ruby'}>
                {isUp ? '+' : ''}{s.changePercent ? s.changePercent.toFixed(2) : '0.00'}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <div className="virtual-funds-badge">
              <i className="fa-solid fa-wallet"></i>
              <span>${(user.virtualBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="user-profile-badge">
              <div className="avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                <span className={`role-tag ${user.role}`}>{user.role}</span>
              </div>
              <button 
                onClick={onLogout}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}
                title="Log Out"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => onOpenAuth('login')}>
              <i className="fa-solid fa-right-to-bracket"></i> Log In
            </button>
            <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>
              <i className="fa-solid fa-user-plus"></i> Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
