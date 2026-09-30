function AdminPanel({ stocks, onRefreshStocks, showToast }) {
  const [stats, setStats] = React.useState(null);
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Form state
  const [symbol, setSymbol] = React.useState('');
  const [name, setName] = React.useState('');
  const [sector, setSector] = React.useState('Technology');
  const [price, setPrice] = React.useState('');
  const [peRatio, setPeRatio] = React.useState('25.0');
  const [marketCap, setMarketCap] = React.useState('10B');

  const fetchStats = async () => {
    try {
      const res = await window.API.get('/admin/system-stats');
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!symbol || !name || !price) {
      showToast('Please enter symbol, company name, and price.', 'error');
      return;
    }

    try {
      const res = await window.API.post('/admin/stocks', {
        symbol,
        name,
        sector,
        price: parseFloat(price),
        peRatio: parseFloat(peRatio),
        marketCap
      });

      if (res.success) {
        showToast(res.message, 'success');
        setShowAddModal(false);
        setSymbol('');
        setName('');
        setPrice('');
        onRefreshStocks();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to list stock.', 'error');
    }
  };

  const handleToggleStatus = async (stockSymbol) => {
    try {
      const res = await window.API.patch(`/admin/stocks/${stockSymbol}/status`, {});
      if (res.success) {
        showToast(res.message, 'info');
        onRefreshStocks();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Action failed.', 'error');
    }
  };

  const handleDeleteStock = async (stockSymbol) => {
    if (!confirm(`Are you sure you want to delete stock listing ${stockSymbol}?`)) return;
    try {
      const res = await window.API.delete(`/admin/stocks/${stockSymbol}`);
      if (res.success) {
        showToast(res.message, 'success');
        onRefreshStocks();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--amber)' }}>
            <i className="fa-solid fa-user-shield"></i> Admin Management Control Panel
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            System overview, platform metrics, and administrative stock listing controls.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="fa-solid fa-plus"></i> List New Stock
        </button>
      </div>

      {/* System Metrics */}
      {stats && (
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <span className="stat-title">Platform Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-title">Listed US Stocks</span>
            <span className="stat-value" style={{ color: 'var(--cyan)' }}>{stats.totalStocks}</span>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-title">Total Platform Trades</span>
            <span className="stat-value">{stats.totalTransactions}</span>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-title">Volume Executed</span>
            <span className="stat-value text-emerald">
              ${(stats.totalTradeVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Admin Stock Management Table */}
      <div className="glass-card table-container">
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
          Stock Listing Controls & Trading Halts
        </h3>
        <table className="tradex-table">
          <thead>
            <tr>
              <th>Symbol & Name</th>
              <th>Sector</th>
              <th>Current Price</th>
              <th>Trading Status</th>
              <th>Market Cap</th>
              <th style={{ textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.symbol}>
                <td>
                  <div className="stock-pill">
                    <span className="symbol-badge">{s.symbol}</span>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                  </div>
                </td>
                <td>{s.sector}</td>
                <td>${s.currentPrice ? s.currentPrice.toFixed(2) : '0.00'}</td>
                <td>
                  <span className={`role-tag ${s.isTradingActive ? 'user' : 'admin'}`}>
                    {s.isTradingActive ? 'ACTIVE' : 'HALTED / SUSPENDED'}
                  </span>
                </td>
                <td>{s.marketCap || 'N/A'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className={`btn ${s.isTradingActive ? 'btn-ruby' : 'btn-emerald'}`}
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => handleToggleStatus(s.symbol)}
                    >
                      {s.isTradingActive ? 'Halt Trading' : 'Resume Trading'}
                    </button>
                    <button 
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--ruby)' }}
                      onClick={() => handleDeleteStock(s.symbol)}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">List New US Stock</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock Symbol (Ticker)</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  placeholder="e.g. NFLX, DIS, PLTR"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Company Name</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  placeholder="e.g. Netflix Inc."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sector</label>
                  <select 
                    className="input-glass"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Consumer Cyclical">Consumer Cyclical</option>
                    <option value="Communication Services">Communication Services</option>
                    <option value="ETF Index">ETF Index</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Initial Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input-glass" 
                    placeholder="150.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>P/E Ratio</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="input-glass" 
                    placeholder="25.0"
                    value={peRatio}
                    onChange={e => setPeRatio(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Market Cap</label>
                  <input 
                    type="text" 
                    className="input-glass" 
                    placeholder="e.g. 50B or 1.2T"
                    value={marketCap}
                    onChange={e => setMarketCap(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

window.AdminPanel = AdminPanel;
