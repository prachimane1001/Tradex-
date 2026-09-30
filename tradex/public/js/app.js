function App() {
  const [user, setUser] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [stocks, setStocks] = React.useState([]);
  const [portfolio, setPortfolio] = React.useState([]);
  const [portfolioSummary, setPortfolioSummary] = React.useState(null);
  const [watchlist, setWatchlist] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [marketSummary, setMarketSummary] = React.useState({ topGainers: [], topLosers: [], mostActive: [] });
  
  const [selectedStock, setSelectedStock] = React.useState(null);
  const [tradeModalStock, setTradeModalStock] = React.useState(null);
  const [tradeModalType, setTradeModalType] = React.useState('BUY');
  const [authModalMode, setAuthModalMode] = React.useState(null); // 'login' or 'register'

  const [toasts, setToasts] = React.useState([]);

  window.setActiveTab = setActiveTab;

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch stocks list
  const fetchStocks = async () => {
    try {
      const res = await window.API.get('/stocks');
      if (res.success) {
        setStocks(res.stocks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch market summary
  const fetchMarketSummary = async () => {
    try {
      const res = await window.API.get('/stocks/market-summary');
      if (res.success) {
        setMarketSummary(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch user portfolio
  const fetchPortfolio = async () => {
    if (!user) return;
    try {
      const res = await window.API.get('/portfolio');
      if (res.success) {
        setPortfolio(res.holdings);
        setPortfolioSummary(res.summary);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch user watchlist
  const fetchWatchlist = async () => {
    if (!user) return;
    try {
      const res = await window.API.get('/watchlist');
      if (res.success) {
        setWatchlist(res.watchlist);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch transactions log
  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const res = await window.API.get('/trade/history');
      if (res.success) {
        setTransactions(res.transactions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Restore authenticated user profile on app startup
  const checkAuth = async () => {
    const token = window.API.getToken();
    if (!token) return;

    try {
      const res = await window.API.get('/auth/me');
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      window.API.setToken(null);
      setUser(null);
    }
  };

  // Setup real-time price updates via Server-Sent Events (SSE)
  React.useEffect(() => {
    fetchStocks();
    fetchMarketSummary();
    checkAuth();

    const eventSource = new EventSource('/api/stocks/live-stream');
    eventSource.onmessage = (e) => {
      try {
        const updatedTickers = JSON.parse(e.data);
        if (Array.isArray(updatedTickers)) {
          setStocks(prev => {
            const map = new Map(prev.map(s => [s.symbol, s]));
            updatedTickers.forEach(u => map.set(u.symbol, u));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error('SSE Parse Error:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Sync user-dependent data when user changes
  React.useEffect(() => {
    if (user) {
      fetchPortfolio();
      fetchWatchlist();
      fetchTransactions();
    } else {
      setPortfolio([]);
      setPortfolioSummary(null);
      setWatchlist([]);
      setTransactions([]);
    }
  }, [user]);

  const handleLogout = () => {
    window.API.setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const handleToggleWatchlist = async (symbol) => {
    if (!user) {
      setAuthModalMode('login');
      showToast('Please log in to manage your watchlist.', 'info');
      return;
    }

    const isWatchlisted = watchlist.some(w => w.symbol === symbol);
    try {
      if (isWatchlisted) {
        const res = await window.API.delete(`/watchlist/${symbol}`);
        if (res.success) {
          showToast(res.message, 'info');
          fetchWatchlist();
        }
      } else {
        const res = await window.API.post('/watchlist/add', { symbol });
        if (res.success) {
          showToast(res.message, 'success');
          fetchWatchlist();
        }
      }
    } catch (err) {
      showToast(err.message || 'Watchlist action failed.', 'error');
    }
  };

  const handleOpenTradeModal = (stock, type = 'BUY') => {
    if (!user) {
      setAuthModalMode('login');
      showToast('Please log in to execute trades.', 'info');
      return;
    }
    setTradeModalStock(stock);
    setTradeModalType(type);
  };

  const handleTradeExecuted = () => {
    checkAuth();
    fetchPortfolio();
    fetchTransactions();
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        user={user} 
        stocks={stocks} 
        onOpenAuth={(mode) => setAuthModalMode(mode)} 
        onLogout={handleLogout}
      />

      <div className="app-main">
        {/* Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setSelectedStock(null); setActiveTab(tab); }} 
          user={user}
        />

        {/* Content View Routing */}
        <main className="content-area">
          {selectedStock ? (
            <StockDetail 
              stock={selectedStock} 
              onBack={() => setSelectedStock(null)}
              onOpenTrade={handleOpenTradeModal}
              onToggleWatchlist={handleToggleWatchlist}
              isWatchlisted={watchlist.some(w => w.symbol === selectedStock.symbol)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  user={user}
                  portfolioSummary={portfolioSummary}
                  stocks={stocks}
                  marketSummary={marketSummary}
                  onSelectStock={(s) => setSelectedStock(s)}
                  onOpenTrade={handleOpenTradeModal}
                />
              )}

              {activeTab === 'market' && (
                <StockMarket 
                  stocks={stocks}
                  watchlist={watchlist}
                  onSelectStock={(s) => setSelectedStock(s)}
                  onOpenTrade={handleOpenTradeModal}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              )}

              {activeTab === 'portfolio' && (
                <PortfolioView 
                  portfolio={portfolio}
                  summary={portfolioSummary}
                  stocks={stocks}
                  onSelectStock={(s) => setSelectedStock(s)}
                  onOpenTrade={handleOpenTradeModal}
                />
              )}

              {activeTab === 'watchlist' && (
                <WatchlistView 
                  watchlist={watchlist}
                  stocks={stocks}
                  onSelectStock={(s) => setSelectedStock(s)}
                  onOpenTrade={handleOpenTradeModal}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              )}

              {activeTab === 'history' && (
                <TransactionsView transactions={transactions} />
              )}

              {activeTab === 'admin' && (
                <AdminPanel 
                  stocks={stocks} 
                  onRefreshStocks={fetchStocks} 
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Trade Execution Modal */}
      {tradeModalStock && (
        <TradeModal 
          stock={tradeModalStock}
          initialType={tradeModalType}
          user={user}
          portfolio={portfolio}
          onClose={() => setTradeModalStock(null)}
          onExecuteTrade={handleTradeExecuted}
          showToast={showToast}
        />
      )}

      {/* Login & Registration Modal */}
      {authModalMode && (
        <AuthModal 
          mode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onLoginSuccess={(u) => { setUser(u); fetchPortfolio(); fetchWatchlist(); fetchTransactions(); }}
          showToast={showToast}
        />
      )}

      {/* Dynamic Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`fa-solid fa-${t.type === 'success' ? 'circle-check' : t.type === 'error' ? 'circle-xmark' : 'circle-info'}`}></i>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
