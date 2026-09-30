function Sidebar({ activeTab, setActiveTab, user }) {
  const isAdmin = user && user.role === 'admin';

  return (
    <aside className="sidebar">
      <div 
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <i className="fa-solid fa-chart-pie" style={{ width: '20px' }}></i>
        <span>Dashboard</span>
      </div>

      <div 
        className={`nav-item ${activeTab === 'market' ? 'active' : ''}`}
        onClick={() => setActiveTab('market')}
      >
        <i className="fa-solid fa-arrow-trend-up" style={{ width: '20px' }}></i>
        <span>Stock Market</span>
      </div>

      <div 
        className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
        onClick={() => setActiveTab('portfolio')}
      >
        <i className="fa-solid fa-briefcase" style={{ width: '20px' }}></i>
        <span>Portfolio</span>
      </div>

      <div 
        className={`nav-item ${activeTab === 'watchlist' ? 'active' : ''}`}
        onClick={() => setActiveTab('watchlist')}
      >
        <i className="fa-solid fa-star" style={{ width: '20px' }}></i>
        <span>Watchlist</span>
      </div>

      <div 
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <i className="fa-solid fa-receipt" style={{ width: '20px' }}></i>
        <span>Trade Log</span>
      </div>

      {isAdmin && (
        <div 
          className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
          style={{ marginTop: 'auto', border: '1px solid rgba(245, 158, 11, 0.3)' }}
        >
          <i className="fa-solid fa-user-shield text-amber" style={{ width: '20px' }}></i>
          <span className="text-amber">Admin Panel</span>
        </div>
      )}
    </aside>
  );
}

window.Sidebar = Sidebar;
