// TradeX Full Production React Application Bundle (Pure JavaScript, Zero Babel Dependency)
(function() {
  const h = React.createElement;

  // --- API CLIENT ---
  const API = {
    getToken() { return localStorage.getItem('tradex_token'); },
    setToken(token) {
      if (token) localStorage.setItem('tradex_token', token);
      else localStorage.removeItem('tradex_token');
    },
    async request(endpoint, method = 'GET', body = null) {
      const headers = { 'Content-Type': 'application/json' };
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const config = { method, headers };
      if (body) config.body = JSON.stringify(body);
      try {
        const res = await fetch(`/api${endpoint}`, config);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'API Request Failed');
        return data;
      } catch (err) {
        console.error(`API Error (${endpoint}):`, err);
        throw err;
      }
    },
    get(endpoint) { return this.request(endpoint, 'GET'); },
    post(endpoint, body) { return this.request(endpoint, 'POST', body); },
    put(endpoint, body) { return this.request(endpoint, 'PUT', body); },
    patch(endpoint, body) { return this.request(endpoint, 'PATCH', body); },
    delete(endpoint) { return this.request(endpoint, 'DELETE'); }
  };
  window.API = API;

  // --- CHART UTILS ---
  window.ChartUtils = {
    renderStockChart(canvasId, historyData, isPositive = true) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (canvas._chartInstance) canvas._chartInstance.destroy();
      if (!historyData || historyData.length === 0) return null;

      const labels = historyData.map(h => new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const prices = historyData.map(h => h.price);

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      if (isPositive) {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      } else {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
      }
      const color = isPositive ? '#10b981' : '#ef4444';

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Price ($)',
            data: prices,
            borderColor: color,
            borderWidth: 2,
            fill: true,
            backgroundColor: gradient,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', maxTicksLimit: 6 } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
          }
        }
      });
      canvas._chartInstance = chart;
      return chart;
    }
  };

  // --- NAVBAR COMPONENT ---
  function Navbar({ user, stocks, onOpenAuth, onLogout }) {
    return h('nav', { className: 'navbar' },
      h('a', { href: '#', className: 'navbar-brand' },
        h('i', { className: 'fa-solid fa-chart-line-up' }),
        h('span', null, 'TradeX')
      ),
      h('div', { className: 'ticker-tape' },
        stocks.slice(0, 6).map(s => {
          const isUp = (s.changePercent || 0) >= 0;
          return h('div', { key: s.symbol, className: 'ticker-item' },
            h('span', { style: { fontWeight: 700 } }, s.symbol),
            h('span', null, `$${s.currentPrice ? s.currentPrice.toFixed(2) : '0.00'}`),
            h('span', { className: isUp ? 'text-emerald' : 'text-ruby' },
              `${isUp ? '+' : ''}${s.changePercent ? s.changePercent.toFixed(2) : '0.00'}%`
            )
          );
        })
      ),
      h('div', { className: 'navbar-right' },
        user ? h('React.Fragment', null,
          h('div', { className: 'virtual-funds-badge' },
            h('i', { className: 'fa-solid fa-wallet' }),
            h('span', null, `$${(user.virtualBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
          ),
          h('div', { className: 'user-profile-badge' },
            h('div', { className: 'avatar-circle' }, user.name ? user.name.charAt(0).toUpperCase() : 'U'),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
              h('span', { style: { fontSize: '0.85rem', fontWeight: 600 } }, user.name),
              h('span', { className: `role-tag ${user.role}` }, user.role)
            ),
            h('button', {
              onClick: onLogout,
              className: 'btn btn-outline',
              style: { padding: '0.35rem 0.6rem', fontSize: '0.75rem', marginLeft: '0.5rem' },
              title: 'Log Out'
            }, h('i', { className: 'fa-solid fa-right-from-bracket' }))
          )
        ) : h('div', { style: { display: 'flex', gap: '0.75rem' } },
          h('button', { className: 'btn btn-outline', onClick: () => onOpenAuth('login') },
            h('i', { className: 'fa-solid fa-right-to-bracket' }), ' Log In'
          ),
          h('button', { className: 'btn btn-primary', onClick: () => onOpenAuth('register') },
            h('i', { className: 'fa-solid fa-user-plus' }), ' Get Started'
          )
        )
      )
    );
  }

  // --- SIDEBAR COMPONENT ---
  function Sidebar({ activeTab, setActiveTab, user }) {
    const isAdmin = user && user.role === 'admin';
    return h('aside', { className: 'sidebar' },
      h('div', {
        className: `nav-item ${activeTab === 'dashboard' ? 'active' : ''}`,
        onClick: () => setActiveTab('dashboard')
      }, h('i', { className: 'fa-solid fa-chart-pie', style: { width: '20px' } }), h('span', null, 'Dashboard')),
      h('div', {
        className: `nav-item ${activeTab === 'market' ? 'active' : ''}`,
        onClick: () => setActiveTab('market')
      }, h('i', { className: 'fa-solid fa-arrow-trend-up', style: { width: '20px' } }), h('span', null, 'Stock Market')),
      h('div', {
        className: `nav-item ${activeTab === 'portfolio' ? 'active' : ''}`,
        onClick: () => setActiveTab('portfolio')
      }, h('i', { className: 'fa-solid fa-briefcase', style: { width: '20px' } }), h('span', null, 'Portfolio')),
      h('div', {
        className: `nav-item ${activeTab === 'watchlist' ? 'active' : ''}`,
        onClick: () => setActiveTab('watchlist')
      }, h('i', { className: 'fa-solid fa-star', style: { width: '20px' } }), h('span', null, 'Watchlist')),
      h('div', {
        className: `nav-item ${activeTab === 'history' ? 'active' : ''}`,
        onClick: () => setActiveTab('history')
      }, h('i', { className: 'fa-solid fa-receipt', style: { width: '20px' } }), h('span', null, 'Trade Log')),
      isAdmin && h('div', {
        className: `nav-item ${activeTab === 'admin' ? 'active' : ''}`,
        onClick: () => setActiveTab('admin'),
        style: { marginTop: 'auto', border: '1px solid rgba(245, 158, 11, 0.3)' }
      }, h('i', { className: 'fa-solid fa-user-shield text-amber', style: { width: '20px' } }), h('span', { className: 'text-amber' }, 'Admin Panel'))
    );
  }

  // --- DASHBOARD COMPONENT ---
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

    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2rem' } },
      h('div', null,
        h('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 } }, 'Trading Dashboard'),
        h('p', { style: { color: 'var(--text-muted)' } },
          'Welcome back, ', h('strong', { style: { color: '#fff' } }, user ? user.name : 'Trader'), '! Monitor your paper portfolio performance and execute real-time trades.'
        )
      ),
      h('div', { className: 'stats-grid' },
        h('div', { className: 'glass-card stat-card' },
          h('span', { className: 'stat-title' }, 'Total Net Worth'),
          h('span', { className: 'stat-value' }, `$${summary.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
          h('span', { className: `stat-sub ${isReturnPos ? 'text-emerald' : 'text-ruby'}` },
            h('i', { className: `fa-solid fa-arrow-trend-${isReturnPos ? 'up' : 'down'}` }),
            ` ${isReturnPos ? '+' : ''}$${summary.totalReturnDollars.toFixed(2)} (${summary.totalReturnPercent.toFixed(2)}%)`
          )
        ),
        h('div', { className: 'glass-card stat-card' },
          h('span', { className: 'stat-title' }, 'Buying Power (Cash)'),
          h('span', { className: 'stat-value', style: { color: 'var(--cyan)' } }, `$${summary.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
          h('span', { className: 'stat-sub', style: { color: 'var(--text-muted)' } }, 'Virtual Funds Available')
        ),
        h('div', { className: 'glass-card stat-card' },
          h('span', { className: 'stat-title' }, 'Invested Holdings'),
          h('span', { className: 'stat-value' }, `$${summary.totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
          h('span', { className: 'stat-sub', style: { color: 'var(--text-muted)' } }, 'Active Stock Value')
        ),
        h('div', { className: 'glass-card stat-card' },
          h('span', { className: 'stat-title' }, "Today's P&L"),
          h('span', { className: `stat-value ${isTodayPos ? 'text-emerald' : 'text-ruby'}` }, `${isTodayPos ? '+' : ''}$${summary.todayUnrealizedPnL.toFixed(2)}`),
          h('span', { className: `stat-sub ${isTodayPos ? 'text-emerald' : 'text-ruby'}` }, 'Unrealized Day Change')
        )
      ),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } },
        h('div', { className: 'glass-card' },
          h('h3', { style: { fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' } },
            h('i', { className: 'fa-solid fa-fire text-emerald' }), ' Top Gainers Today'
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' } },
            (marketSummary.topGainers || []).slice(0, 4).map(s =>
              h('div', {
                key: s.symbol,
                onClick: () => onSelectStock(s),
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }
              },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
                  h('span', { className: 'symbol-badge' }, s.symbol),
                  h('span', { style: { fontWeight: 600 } }, s.name)
                ),
                h('div', { style: { textAlign: 'right' } },
                  h('div', { style: { fontWeight: 700 } }, `$${s.currentPrice.toFixed(2)}`),
                  h('div', { className: 'text-emerald', style: { fontSize: '0.85rem', fontWeight: 600 } }, `+${s.changePercent.toFixed(2)}%`)
                )
              )
            )
          )
        ),
        h('div', { className: 'glass-card' },
          h('h3', { style: { fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' } },
            h('i', { className: 'fa-solid fa-arrow-trend-down text-ruby' }), ' Top Market Losers'
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' } },
            (marketSummary.topLosers || []).slice(0, 4).map(s =>
              h('div', {
                key: s.symbol,
                onClick: () => onSelectStock(s),
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }
              },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
                  h('span', { className: 'symbol-badge', style: { borderColor: 'rgba(239, 68, 68, 0.4)' } }, s.symbol),
                  h('span', { style: { fontWeight: 600 } }, s.name)
                ),
                h('div', { style: { textAlign: 'right' } },
                  h('div', { style: { fontWeight: 700 } }, `$${s.currentPrice.toFixed(2)}`),
                  h('div', { className: 'text-ruby', style: { fontSize: '0.85rem', fontWeight: 600 } }, `${s.changePercent.toFixed(2)}%`)
                )
              )
            )
          )
        )
      )
    );
  }

  // --- STOCK MARKET COMPONENT ---
  function StockMarket({ stocks, watchlist, onSelectStock, onOpenTrade, onToggleWatchlist }) {
    const [search, setSearch] = React.useState('');
    const [selectedSector, setSelectedSector] = React.useState('ALL');
    const sectors = ['ALL', 'Technology', 'Consumer Cyclical', 'Communication Services', 'ETF Index', 'Financial Services'];
    const watchlistSymbolSet = new Set((watchlist || []).map(w => w.symbol));

    const filteredStocks = stocks.filter(s => {
      const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
      const matchesSector = selectedSector === 'ALL' || s.sector.toUpperCase() === selectedSector.toUpperCase();
      return matchesSearch && matchesSector;
    });

    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
      h('div', null,
        h('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 } }, 'US Stock Market Directory'),
        h('p', { style: { color: 'var(--text-muted)' } }, 'Explore real-time US stock prices, historical trends, and execute virtual market orders.')
      ),
      h('div', { className: 'glass-card', style: { display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' } },
        h('div', { style: { position: 'relative', flex: 1, minWidth: '280px' } },
          h('i', { className: 'fa-solid fa-magnifying-glass', style: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' } }),
          h('input', {
            type: 'text',
            className: 'input-glass',
            style: { paddingLeft: '2.75rem' },
            placeholder: 'Search stock by symbol or company name (e.g. AAPL, NVDA)...',
            value: search,
            onChange: e => setSearch(e.target.value)
          })
        ),
        h('div', { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' } },
          sectors.map(sec =>
            h('button', {
              key: sec,
              onClick: () => setSelectedSector(sec),
              className: `btn ${selectedSector === sec ? 'btn-primary' : 'btn-outline'}`,
              style: { fontSize: '0.8rem', padding: '0.4rem 0.8rem' }
            }, sec)
          )
        )
      ),
      h('div', { className: 'glass-card table-container' },
        h('table', { className: 'tradex-table' },
          h('thead', null,
            h('tr', null,
              h('th', { style: { width: '40px' } }),
              h('th', null, 'Symbol & Name'),
              h('th', null, 'Sector'),
              h('th', null, 'Current Price'),
              h('th', null, '24h Change'),
              h('th', null, '24h Range (Low - High)'),
              h('th', null, 'Volume'),
              h('th', { style: { textAlign: 'right' } }, 'Actions')
            )
          ),
          h('tbody', null,
            filteredStocks.map(s => {
              const isUp = (s.changePercent || 0) >= 0;
              const isWatchlisted = watchlistSymbolSet.has(s.symbol);
              return h('tr', { key: s.symbol },
                h('td', null,
                  h('button', {
                    onClick: (e) => { e.stopPropagation(); onToggleWatchlist(s.symbol); },
                    style: { background: 'none', border: 'none', cursor: 'pointer', color: isWatchlisted ? 'var(--amber)' : 'var(--text-dim)' },
                    title: isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'
                  }, h('i', { className: `fa-${isWatchlisted ? 'solid' : 'regular'} fa-star` }))
                ),
                h('td', { onClick: () => onSelectStock(s), style: { cursor: 'pointer' } },
                  h('div', { className: 'stock-pill' },
                    h('span', { className: 'symbol-badge' }, s.symbol),
                    h('div', null,
                      h('div', { style: { fontWeight: 600 } }, s.name),
                      !s.isTradingActive && h('span', { style: { fontSize: '0.7rem', color: 'var(--amber)', fontWeight: 600 } }, '[TRADING HALTED]')
                    )
                  )
                ),
                h('td', null, h('span', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, s.sector)),
                h('td', null, h('span', { style: { fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.05rem' } }, `$${s.currentPrice ? s.currentPrice.toFixed(2) : '0.00'}`)),
                h('td', null, h('span', { className: isUp ? 'text-emerald' : 'text-ruby', style: { fontWeight: 700 } }, `${isUp ? '+' : ''}$${s.change ? s.change.toFixed(2) : '0.00'} (${s.changePercent ? s.changePercent.toFixed(2) : '0.00'}%)`)),
                h('td', null, h('span', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, `$${s.dayLow ? s.dayLow.toFixed(2) : '0'} - $${s.dayHigh ? s.dayHigh.toFixed(2) : '0'}`)),
                h('td', null, h('span', { style: { fontSize: '0.85rem', color: 'var(--text-dim)' } }, (s.volume || 0).toLocaleString())),
                h('td', { style: { textAlign: 'right' } },
                  h('div', { style: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' } },
                    h('button', { className: 'btn btn-emerald', style: { padding: '0.4rem 0.8rem', fontSize: '0.8rem' }, onClick: () => onOpenTrade(s, 'BUY'), disabled: !s.isTradingActive }, 'Buy'),
                    h('button', { className: 'btn btn-ruby', style: { padding: '0.4rem 0.8rem', fontSize: '0.8rem' }, onClick: () => onOpenTrade(s, 'SELL'), disabled: !s.isTradingActive }, 'Sell')
                  )
                )
              );
            })
          )
        )
      )
    );
  }

  // --- STOCK DETAIL COMPONENT ---
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

    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('button', { className: 'btn btn-outline', onClick: onBack }, h('i', { className: 'fa-solid fa-arrow-left' }), ' Back to Market'),
        h('div', { style: { display: 'flex', gap: '0.75rem' } },
          h('button', { className: 'btn btn-outline', onClick: () => onToggleWatchlist(stock.symbol) },
            h('i', { className: `fa-${isWatchlisted ? 'solid' : 'regular'} fa-star ${isWatchlisted ? 'text-amber' : ''}` }),
            ` ${isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}`
          ),
          h('button', { className: 'btn btn-emerald', onClick: () => onOpenTrade(stock, 'BUY') }, h('i', { className: 'fa-solid fa-cart-shopping' }), ` Buy ${stock.symbol}`),
          h('button', { className: 'btn btn-ruby', onClick: () => onOpenTrade(stock, 'SELL') }, h('i', { className: 'fa-solid fa-hand-holding-dollar' }), ` Sell ${stock.symbol}`)
        )
      ),
      h('div', { className: 'glass-card', style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' } },
        h('div', null,
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' } },
            h('span', { className: 'symbol-badge', style: { fontSize: '1.1rem', padding: '0.4rem 0.8rem' } }, stock.symbol),
            h('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800 } }, stock.name)
          ),
          h('span', { style: { color: 'var(--text-muted)', fontSize: '0.9rem' } }, 'Sector: ', h('strong', null, stock.sector))
        ),
        h('div', { style: { textAlign: 'right' } },
          h('div', { style: { fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800 } }, `$${stock.currentPrice ? stock.currentPrice.toFixed(2) : '0.00'}`),
          h('div', { className: isUp ? 'text-emerald' : 'text-ruby', style: { fontSize: '1.1rem', fontWeight: 700 } },
            h('i', { className: `fa-solid fa-arrow-trend-${isUp ? 'up' : 'down'}` }),
            ` ${isUp ? '+' : ''}$${stock.change ? stock.change.toFixed(2) : '0.00'} (${stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%)`
          )
        )
      ),
      h('div', { className: 'glass-card', style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          h('h3', { style: { fontFamily: 'var(--font-heading)' } }, h('i', { className: 'fa-solid fa-chart-candlestick text-cyan' }), ' Price History & Live Trend'),
          h('span', { style: { fontSize: '0.8rem', color: 'var(--text-dim)' } }, 'Real-Time Stream Active (Updates every 3s)')
        ),
        h('div', { style: { height: '350px', position: 'relative' } },
          h('canvas', { id: 'stockDetailChartCanvas', ref: chartCanvasRef })
        )
      ),
      h('div', { className: 'stats-grid' },
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, '24h Day Range'), h('span', { className: 'stat-value', style: { fontSize: '1.3rem' } }, `$${stock.dayLow ? stock.dayLow.toFixed(2) : '0'} - $${stock.dayHigh ? stock.dayHigh.toFixed(2) : '0'}`)),
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, '24h Volume'), h('span', { className: 'stat-value', style: { fontSize: '1.3rem' } }, (stock.volume || 0).toLocaleString())),
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, 'Market Cap'), h('span', { className: 'stat-value', style: { fontSize: '1.3rem', color: 'var(--cyan)' } }, stock.marketCap || 'N/A')),
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, 'P/E Ratio'), h('span', { className: 'stat-value', style: { fontSize: '1.3rem' } }, stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A'))
      )
    );
  }

  // --- PORTFOLIO VIEW COMPONENT ---
  function PortfolioView({ portfolio, summary, stocks, onSelectStock, onOpenTrade }) {
    const stockMap = new Map((stocks || []).map(s => [s.symbol, s]));
    const holdings = portfolio || [];

    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
      h('div', null,
        h('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 } }, 'Virtual Investment Portfolio'),
        h('p', { style: { color: 'var(--text-muted)' } }, 'Track your open stock positions, average buy prices, unrealized gains, and total return.')
      ),
      h('div', { className: 'glass-card table-container' },
        holdings.length === 0 ? h('div', { style: { textAlign: 'center', padding: '3rem 1rem' } },
          h('i', { className: 'fa-solid fa-folder-open', style: { fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '1rem' } }),
          h('h3', { style: { fontFamily: 'var(--font-heading)' } }, 'No Active Holdings'),
          h('p', { style: { color: 'var(--text-muted)', marginBottom: '1.5rem' } }, 'You currently have no open stock positions in your portfolio.'),
          h('button', { className: 'btn btn-primary', onClick: () => window.setActiveTab('market') }, h('i', { className: 'fa-solid fa-magnifying-glass' }), ' Explore US Stocks')
        ) : h('table', { className: 'tradex-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Holding Symbol & Name'),
              h('th', null, 'Quantity'),
              h('th', null, 'Avg Buy Price'),
              h('th', null, 'Current Price'),
              h('th', null, 'Total Invested'),
              h('th', null, 'Current Value'),
              h('th', null, 'Unrealized Return'),
              h('th', { style: { textAlign: 'right' } }, 'Trade Actions')
            )
          ),
          h('tbody', null,
            holdings.map(hItem => {
              const stock = stockMap.get(hItem.symbol) || {};
              const isGain = hItem.totalGainLoss >= 0;
              return h('tr', { key: hItem.symbol },
                h('td', { onClick: () => onSelectStock(stock), style: { cursor: 'pointer' } },
                  h('div', { className: 'stock-pill' },
                    h('span', { className: 'symbol-badge' }, hItem.symbol),
                    h('span', { style: { fontWeight: 600 } }, hItem.name)
                  )
                ),
                h('td', null, h('span', { style: { fontWeight: 700, fontFamily: 'var(--font-heading)' } }, `${hItem.quantity} shares`)),
                h('td', null, `$${hItem.averageBuyPrice ? hItem.averageBuyPrice.toFixed(2) : '0.00'}`),
                h('td', null, h('span', { style: { fontWeight: 700 } }, `$${hItem.currentPrice ? hItem.currentPrice.toFixed(2) : '0.00'}`)),
                h('td', null, `$${hItem.totalInvested ? hItem.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`),
                h('td', null, h('span', { style: { fontWeight: 700 } }, `$${hItem.currentValue ? hItem.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`)),
                h('td', null, h('span', { className: isGain ? 'text-emerald' : 'text-ruby', style: { fontWeight: 700 } }, `${isGain ? '+' : ''}$${hItem.totalGainLoss.toFixed(2)} (${hItem.totalGainLossPercent.toFixed(2)}%)`)),
                h('td', { style: { textAlign: 'right' } },
                  h('div', { style: { display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' } },
                    h('button', { className: 'btn btn-emerald', style: { padding: '0.35rem 0.65rem', fontSize: '0.75rem' }, onClick: () => onOpenTrade(stock, 'BUY') }, 'Buy More'),
                    h('button', { className: 'btn btn-ruby', style: { padding: '0.35rem 0.65rem', fontSize: '0.75rem' }, onClick: () => onOpenTrade(stock, 'SELL') }, 'Sell Shares')
                  )
                )
              );
            })
          )
        )
      )
    );
  }

  // --- WATCHLIST VIEW COMPONENT ---
  function WatchlistView({ watchlist, stocks, onSelectStock, onOpenTrade, onToggleWatchlist }) {
    const stockMap = new Map((stocks || []).map(s => [s.symbol, s]));

    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
      h('div', null,
        h('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 } }, 'Favorite Stock Watchlist'),
        h('p', { style: { color: 'var(--text-muted)' } }, "Keep an eye on stocks you're interested in trading and track real-time price triggers.")
      ),
      h('div', { className: 'glass-card table-container' },
        (!watchlist || watchlist.length === 0) ? h('div', { style: { textAlign: 'center', padding: '3rem 1rem' } },
          h('i', { className: 'fa-regular fa-star', style: { fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '1rem' } }),
          h('h3', { style: { fontFamily: 'var(--font-heading)' } }, 'Watchlist is Empty'),
          h('p', { style: { color: 'var(--text-muted)', marginBottom: '1.5rem' } }, 'Click the star icon next to any stock in the market directory to add it here.')
        ) : h('table', { className: 'tradex-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Stock Symbol & Company'),
              h('th', null, 'Sector'),
              h('th', null, 'Current Price'),
              h('th', null, '24h Change'),
              h('th', null, '24h Volume'),
              h('th', { style: { textAlign: 'right' } }, 'Actions')
            )
          ),
          h('tbody', null,
            watchlist.map(item => {
              const stock = stockMap.get(item.symbol) || item.stock || {};
              const isUp = (stock.changePercent || 0) >= 0;
              return h('tr', { key: item.symbol },
                h('td', { onClick: () => onSelectStock(stock), style: { cursor: 'pointer' } },
                  h('div', { className: 'stock-pill' },
                    h('span', { className: 'symbol-badge' }, item.symbol),
                    h('span', { style: { fontWeight: 600 } }, stock.name)
                  )
                ),
                h('td', null, stock.sector),
                h('td', null, h('span', { style: { fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.05rem' } }, `$${stock.currentPrice ? stock.currentPrice.toFixed(2) : '0.00'}`)),
                h('td', null, h('span', { className: isUp ? 'text-emerald' : 'text-ruby', style: { fontWeight: 700 } }, `${isUp ? '+' : ''}$${stock.change ? stock.change.toFixed(2) : '0.00'} (${stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%)`)),
                h('td', null, (stock.volume || 0).toLocaleString()),
                h('td', { style: { textAlign: 'right' } },
                  h('div', { style: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' } },
                    h('button', { className: 'btn btn-emerald', style: { padding: '0.35rem 0.65rem', fontSize: '0.75rem' }, onClick: () => onOpenTrade(stock, 'BUY') }, 'Buy'),
                    h('button', { className: 'btn btn-ruby', style: { padding: '0.35rem 0.65rem', fontSize: '0.75rem' }, onClick: () => onOpenTrade(stock, 'SELL') }, 'Sell'),
                    h('button', { className: 'btn btn-outline', style: { padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--ruby)' }, onClick: () => onToggleWatchlist(item.symbol) }, h('i', { className: 'fa-solid fa-trash-can' }))
                  )
                )
              );
            })
          )
        )
      )
    );
  }

  // --- TRANSACTIONS VIEW COMPONENT ---
  function TransactionsView({ transactions }) {
    const items = transactions || [];
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
      h('div', null,
        h('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 } }, 'Virtual Trade Transaction Log'),
        h('p', { style: { color: 'var(--text-muted)' } }, 'Historical record of all buy and sell order executions executed on your account.')
      ),
      h('div', { className: 'glass-card table-container' },
        items.length === 0 ? h('div', { style: { textAlign: 'center', padding: '3rem 1rem' } },
          h('i', { className: 'fa-solid fa-receipt', style: { fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '1rem' } }),
          h('h3', { style: { fontFamily: 'var(--font-heading)' } }, 'No Transactions Recorded'),
          h('p', { style: { color: 'var(--text-muted)' } }, 'Your trade execution history will appear here after you place your first order.')
        ) : h('table', { className: 'tradex-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Date & Time'),
              h('th', null, 'Type'),
              h('th', null, 'Stock Symbol'),
              h('th', null, 'Shares Traded'),
              h('th', null, 'Price per Share'),
              h('th', null, 'Total Value')
            )
          ),
          h('tbody', null,
            items.map(t => {
              const isBuy = t.type === 'BUY';
              const date = new Date(t.timestamp).toLocaleString();
              return h('tr', { key: t._id },
                h('td', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, date),
                h('td', null, h('span', { className: `btn ${isBuy ? 'btn-emerald' : 'btn-ruby'}`, style: { padding: '0.2rem 0.5rem', fontSize: '0.7rem', pointerEvents: 'none' } }, t.type)),
                h('td', null, h('span', { className: 'symbol-badge' }, t.symbol)),
                h('td', { style: { fontWeight: 600 } }, `${t.quantity} shares`),
                h('td', null, `$${t.pricePerShare ? t.pricePerShare.toFixed(2) : '0.00'}`),
                h('td', { style: { fontWeight: 700, fontFamily: 'var(--font-heading)' } }, `$${t.totalAmount ? t.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`)
              );
            })
          )
        )
      )
    );
  }

  // --- ADMIN PANEL COMPONENT ---
  function AdminPanel({ stocks, onRefreshStocks, showToast }) {
    const [stats, setStats] = React.useState(null);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [symbol, setSymbol] = React.useState('');
    const [name, setName] = React.useState('');
    const [sector, setSector] = React.useState('Technology');
    const [price, setPrice] = React.useState('');
    const [peRatio, setPeRatio] = React.useState('25.0');
    const [marketCap, setMarketCap] = React.useState('10B');

    const fetchStats = async () => {
      try {
        const res = await window.API.get('/admin/system-stats');
        if (res.success) setStats(res.stats);
      } catch (err) { console.error(err); }
    };

    React.useEffect(() => { fetchStats(); }, []);

    const handleAddStock = async (e) => {
      e.preventDefault();
      if (!symbol || !name || !price) {
        showToast('Please enter symbol, company name, and price.', 'error');
        return;
      }
      try {
        const res = await window.API.post('/admin/stocks', { symbol, name, sector, price: parseFloat(price), peRatio: parseFloat(peRatio), marketCap });
        if (res.success) {
          showToast(res.message, 'success');
          setShowAddModal(false);
          setSymbol(''); setName(''); setPrice('');
          onRefreshStocks(); fetchStats();
        }
      } catch (err) { showToast(err.message || 'Failed to list stock.', 'error'); }
    };

    const handleToggleStatus = async (stockSymbol) => {
      try {
        const res = await window.API.patch(`/admin/stocks/${stockSymbol}/status`, {});
        if (res.success) { showToast(res.message, 'info'); onRefreshStocks(); fetchStats(); }
      } catch (err) { showToast(err.message || 'Action failed.', 'error'); }
    };

    const handleDeleteStock = async (stockSymbol) => {
      if (!confirm(`Are you sure you want to delete stock listing ${stockSymbol}?`)) return;
      try {
        const res = await window.API.delete(`/admin/stocks/${stockSymbol}`);
        if (res.success) { showToast(res.message, 'success'); onRefreshStocks(); fetchStats(); }
      } catch (err) { showToast(err.message || 'Delete failed.', 'error'); }
    };

    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('div', null,
          h('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--amber)' } }, h('i', { className: 'fa-solid fa-user-shield' }), ' Admin Management Control Panel'),
          h('p', { style: { color: 'var(--text-muted)' } }, 'System overview, platform metrics, and administrative stock listing controls.')
        ),
        h('button', { className: 'btn btn-primary', onClick: () => setShowAddModal(true) }, h('i', { className: 'fa-solid fa-plus' }), ' List New Stock')
      ),
      stats && h('div', { className: 'stats-grid' },
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, 'Platform Users'), h('span', { className: 'stat-value' }, stats.totalUsers)),
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, 'Listed US Stocks'), h('span', { className: 'stat-value', style: { color: 'var(--cyan)' } }, stats.totalStocks)),
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, 'Total Platform Trades'), h('span', { className: 'stat-value' }, stats.totalTransactions)),
        h('div', { className: 'glass-card stat-card' }, h('span', { className: 'stat-title' }, 'Volume Executed'), h('span', { className: 'stat-value text-emerald' }, `$${(stats.totalTradeVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`))
      ),
      h('div', { className: 'glass-card table-container' },
        h('h3', { style: { fontFamily: 'var(--font-heading)', marginBottom: '1rem' } }, 'Stock Listing Controls & Trading Halts'),
        h('table', { className: 'tradex-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Symbol & Name'),
              h('th', null, 'Sector'),
              h('th', null, 'Current Price'),
              h('th', null, 'Trading Status'),
              h('th', null, 'Market Cap'),
              h('th', { style: { textAlign: 'right' } }, 'Admin Actions')
            )
          ),
          h('tbody', null,
            stocks.map(s => h('tr', { key: s.symbol },
              h('td', null, h('div', { className: 'stock-pill' }, h('span', { className: 'symbol-badge' }, s.symbol), h('span', { style: { fontWeight: 600 } }, s.name))),
              h('td', null, s.sector),
              h('td', null, `$${s.currentPrice ? s.currentPrice.toFixed(2) : '0.00'}`),
              h('td', null, h('span', { className: `role-tag ${s.isTradingActive ? 'user' : 'admin'}` }, s.isTradingActive ? 'ACTIVE' : 'HALTED / SUSPENDED')),
              h('td', null, s.marketCap || 'N/A'),
              h('td', { style: { textAlign: 'right' } },
                h('div', { style: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' } },
                  h('button', { className: `btn ${s.isTradingActive ? 'btn-ruby' : 'btn-emerald'}`, style: { padding: '0.35rem 0.65rem', fontSize: '0.75rem' }, onClick: () => handleToggleStatus(s.symbol) }, s.isTradingActive ? 'Halt Trading' : 'Resume Trading'),
                  h('button', { className: 'btn btn-outline', style: { padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--ruby)' }, onClick: () => handleDeleteStock(s.symbol) }, h('i', { className: 'fa-solid fa-trash-can' }))
                )
              )
            ))
          )
        )
      ),
      showAddModal && h('div', { className: 'modal-overlay' },
        h('div', { className: 'modal-content' },
          h('div', { className: 'modal-header' },
            h('h2', { className: 'modal-title' }, 'List New US Stock'),
            h('button', { className: 'close-btn', onClick: () => setShowAddModal(false) }, h('i', { className: 'fa-solid fa-xmark' }))
          ),
          h('form', { onSubmit: handleAddStock, style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
            h('div', null, h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Stock Symbol (Ticker)'), h('input', { type: 'text', className: 'input-glass', placeholder: 'e.g. NFLX, DIS, PLTR', value: symbol, onChange: e => setSymbol(e.target.value), required: true })),
            h('div', null, h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Company Name'), h('input', { type: 'text', className: 'input-glass', placeholder: 'e.g. Netflix Inc.', value: name, onChange: e => setName(e.target.value), required: true })),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } },
              h('div', null, h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Sector'), h('select', { className: 'input-glass', value: sector, onChange: e => setSector(e.target.value) },
                ['Technology', 'Consumer Cyclical', 'Communication Services', 'ETF Index', 'Financial Services', 'Healthcare'].map(sec => h('option', { key: sec, value: sec }, sec))
              )),
              h('div', null, h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Initial Price ($)'), h('input', { type: 'number', step: '0.01', className: 'input-glass', placeholder: '150.00', value: price, onChange: e => setPrice(e.target.value), required: true }))
            ),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' } },
              h('div', null, h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'P/E Ratio'), h('input', { type: 'number', step: '0.1', className: 'input-glass', value: peRatio, onChange: e => setPeRatio(e.target.value) })),
              h('div', null, h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Market Cap'), h('input', { type: 'text', className: 'input-glass', value: marketCap, onChange: e => setMarketCap(e.target.value) }))
            ),
            h('div', { style: { display: 'flex', gap: '1rem', marginTop: '1rem' } },
              h('button', { type: 'button', className: 'btn btn-outline', style: { flex: 1 }, onClick: () => setShowAddModal(false) }, 'Cancel'),
              h('button', { type: 'submit', className: 'btn btn-primary', style: { flex: 1 } }, 'Create Listing')
            )
          )
        )
      )
    );
  }

  // --- TRADE MODAL COMPONENT ---
  function TradeModal({ stock, initialType = 'BUY', user, portfolio, onClose, onExecuteTrade, showToast }) {
    const [tradeType, setTradeType] = React.useState(initialType);
    const [quantity, setQuantity] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    if (!stock) return null;

    const currentPrice = stock.currentPrice || 0;
    const numQuantity = parseInt(quantity, 10) || 0;
    const estimatedTotal = parseFloat((currentPrice * numQuantity).toFixed(2));
    const availableBalance = user ? user.virtualBalance : 0;
    const holding = (portfolio || []).find(h => h.symbol === stock.symbol);
    const ownedShares = holding ? holding.quantity : 0;
    const isBuy = tradeType === 'BUY';
    const canAfford = isBuy ? availableBalance >= estimatedTotal : ownedShares >= numQuantity;

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (numQuantity <= 0) { showToast('Please enter a valid positive number of shares.', 'error'); return; }
      if (!canAfford) { showToast(isBuy ? 'Insufficient virtual cash balance.' : `You only own ${ownedShares} shares.`, 'error'); return; }

      setLoading(true);
      try {
        const endpoint = isBuy ? '/trade/buy' : '/trade/sell';
        const res = await window.API.post(endpoint, { symbol: stock.symbol, quantity: numQuantity });
        if (res.success) { showToast(res.message, 'success'); onExecuteTrade(); onClose(); }
      } catch (err) { showToast(err.message || 'Trade execution failed.', 'error'); }
      finally { setLoading(false); }
    };

    return h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-content' },
        h('div', { className: 'modal-header' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
            h('span', { className: 'symbol-badge' }, stock.symbol),
            h('h2', { className: 'modal-title' }, stock.name)
          ),
          h('button', { className: 'close-btn', onClick: onClose }, h('i', { className: 'fa-solid fa-xmark' }))
        ),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' } },
          h('button', { type: 'button', className: `btn ${isBuy ? 'btn-emerald' : 'btn-outline'}`, onClick: () => setTradeType('BUY') }, 'BUY STOCK'),
          h('button', { type: 'button', className: `btn ${!isBuy ? 'btn-ruby' : 'btn-outline'}`, onClick: () => setTradeType('SELL') }, 'SELL STOCK')
        ),
        h('form', { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '1.25rem' } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' } },
            h('span', { style: { color: 'var(--text-muted)', fontSize: '0.9rem' } }, 'Live Market Execution Price'),
            h('span', { style: { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' } }, `$${currentPrice.toFixed(2)}`)
          ),
          h('div', null,
            h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' } }, `Number of Shares to ${tradeType}`),
            h('input', { type: 'number', min: '1', className: 'input-glass', value: quantity, onChange: e => setQuantity(e.target.value), required: true })
          ),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' } },
            h('span', null, isBuy ? 'Available Cash Balance:' : 'Shares Currently Owned:'),
            h('strong', { style: { color: '#fff' } }, isBuy ? `$${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${ownedShares} shares`)
          ),
          h('div', { style: { borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            h('span', { style: { fontFamily: 'var(--font-heading)', fontWeight: 600 } }, 'Estimated Order Total:'),
            h('span', { style: { fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: isBuy ? 'var(--emerald)' : 'var(--ruby)' } }, `$${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
          ),
          h('div', { style: { display: 'flex', gap: '1rem', marginTop: '0.5rem' } },
            h('button', { type: 'button', className: 'btn btn-outline', style: { flex: 1 }, onClick: onClose }, 'Cancel'),
            h('button', { type: 'submit', className: `btn ${isBuy ? 'btn-emerald' : 'btn-ruby'}`, style: { flex: 1 }, disabled: loading || !canAfford || numQuantity <= 0 }, loading ? 'Processing Order...' : `Confirm ${tradeType} Order`)
          )
        )
      )
    );
  }

  // --- AUTH MODAL COMPONENT ---
  function AuthModal({ mode = 'login', onClose, onLoginSuccess, showToast }) {
    const [authMode, setAuthMode] = React.useState(mode);
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [role, setRole] = React.useState('user');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!email || !password || (authMode === 'register' && !name)) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }
      setLoading(true);
      try {
        const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
        const body = authMode === 'login' ? { email, password } : { name, email, password, role };
        const res = await window.API.post(endpoint, body);
        if (res.success) {
          window.API.setToken(res.token);
          showToast(res.message, 'success');
          onLoginSuccess(res.user);
          onClose();
        }
      } catch (err) { showToast(err.message || 'Authentication failed.', 'error'); }
      finally { setLoading(false); }
    };

    const fillDemoAccount = (demoRole) => {
      if (demoRole === 'admin') { setEmail('admin@tradex.com'); setPassword('admin123'); }
      else { setEmail('user@tradex.com'); setPassword('password123'); }
      setAuthMode('login');
    };

    return h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-content' },
        h('div', { className: 'modal-header' },
          h('h2', { className: 'modal-title' }, authMode === 'login' ? 'Log In to TradeX' : 'Create Trader Account'),
          h('button', { className: 'close-btn', onClick: onClose }, h('i', { className: 'fa-solid fa-xmark' }))
        ),
        h('div', { style: { marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' } },
          h('div', { style: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 } }, '⚡ QUICK DEMO LOGIN LOGIN:'),
          h('div', { style: { display: 'flex', gap: '0.5rem' } },
            h('button', { type: 'button', className: 'btn btn-outline', style: { padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1 }, onClick: () => fillDemoAccount('user') }, 'Demo Trader ($100k)'),
            h('button', { type: 'button', className: 'btn btn-outline', style: { padding: '0.3rem 0.6rem', fontSize: '0.75rem', flex: 1, borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--amber)' }, onClick: () => fillDemoAccount('admin') }, 'Admin Account')
          )
        ),
        h('form', { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
          authMode === 'register' && h('div', null,
            h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Full Name'),
            h('input', { type: 'text', className: 'input-glass', placeholder: 'John Trader', value: name, onChange: e => setName(e.target.value), required: true })
          ),
          h('div', null,
            h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Email Address'),
            h('input', { type: 'email', className: 'input-glass', placeholder: 'trader@tradex.com', value: email, onChange: e => setEmail(e.target.value), required: true })
          ),
          h('div', null,
            h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Password'),
            h('input', { type: 'password', className: 'input-glass', placeholder: '••••••••', value: password, onChange: e => setPassword(e.target.value), required: true })
          ),
          authMode === 'register' && h('div', null,
            h('label', { style: { fontSize: '0.85rem', color: 'var(--text-muted)' } }, 'Account Role'),
            h('select', { className: 'input-glass', value: role, onChange: e => setRole(e.target.value) },
              h('option', { value: 'user' }, 'Trader (Paper Trading Account - $100k Virtual Funds)'),
              h('option', { value: 'admin' }, 'Administrator (Stock Listing & Trading Controls)')
            )
          ),
          h('button', { type: 'submit', className: 'btn btn-primary', style: { marginTop: '0.5rem' }, disabled: loading }, loading ? 'Processing...' : (authMode === 'login' ? 'Log In' : 'Create Account'))
        ),
        h('div', { style: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' } },
          authMode === 'login' ? h('span', null, "Don't have an account? ", h('a', { href: '#', onClick: (e) => { e.preventDefault(); setAuthMode('register'); }, style: { color: 'var(--cyan)' } }, 'Register now'))
          : h('span', null, 'Already have an account? ', h('a', { href: '#', onClick: (e) => { e.preventDefault(); setAuthMode('login'); }, style: { color: 'var(--cyan)' } }, 'Log in'))
        )
      )
    );
  }

  // --- MAIN APP ROUTER & ROOT COMPONENT ---
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
    const [authModalMode, setAuthModalMode] = React.useState(null);
    const [toasts, setToasts] = React.useState([]);

    window.setActiveTab = setActiveTab;

    const showToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
    };

    const fetchStocks = async () => {
      try { const res = await window.API.get('/stocks'); if (res.success) setStocks(res.stocks); } catch (err) {}
    };

    const fetchMarketSummary = async () => {
      try { const res = await window.API.get('/stocks/market-summary'); if (res.success) setMarketSummary(res); } catch (err) {}
    };

    const fetchPortfolio = async () => {
      if (!user) return;
      try { const res = await window.API.get('/portfolio'); if (res.success) { setPortfolio(res.holdings); setPortfolioSummary(res.summary); } } catch (err) {}
    };

    const fetchWatchlist = async () => {
      if (!user) return;
      try { const res = await window.API.get('/watchlist'); if (res.success) setWatchlist(res.watchlist); } catch (err) {}
    };

    const fetchTransactions = async () => {
      if (!user) return;
      try { const res = await window.API.get('/trade/history'); if (res.success) setTransactions(res.transactions); } catch (err) {}
    };

    const checkAuth = async () => {
      const token = window.API.getToken();
      if (!token) return;
      try {
        const res = await window.API.get('/auth/me');
        if (res.success) setUser(res.user);
      } catch (err) { window.API.setToken(null); setUser(null); }
    };

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
        } catch (err) {}
      };
      return () => eventSource.close();
    }, []);

    React.useEffect(() => {
      if (user) { fetchPortfolio(); fetchWatchlist(); fetchTransactions(); }
      else { setPortfolio([]); setPortfolioSummary(null); setWatchlist([]); setTransactions([]); }
    }, [user]);

    const handleLogout = () => {
      window.API.setToken(null);
      setUser(null);
      showToast('Logged out successfully.', 'info');
    };

    const handleToggleWatchlist = async (symbol) => {
      if (!user) { setAuthModalMode('login'); showToast('Please log in to manage your watchlist.', 'info'); return; }
      const isWatchlisted = watchlist.some(w => w.symbol === symbol);
      try {
        if (isWatchlisted) {
          const res = await window.API.delete(`/watchlist/${symbol}`);
          if (res.success) { showToast(res.message, 'info'); fetchWatchlist(); }
        } else {
          const res = await window.API.post('/watchlist/add', { symbol });
          if (res.success) { showToast(res.message, 'success'); fetchWatchlist(); }
        }
      } catch (err) { showToast(err.message || 'Watchlist action failed.', 'error'); }
    };

    const handleOpenTradeModal = (stock, type = 'BUY') => {
      if (!user) { setAuthModalMode('login'); showToast('Please log in to execute trades.', 'info'); return; }
      setTradeModalStock(stock); setTradeModalType(type);
    };

    const handleTradeExecuted = () => { checkAuth(); fetchPortfolio(); fetchTransactions(); };

    return h('div', { className: 'app-container' },
      h(Navbar, { user, stocks, onOpenAuth: (mode) => setAuthModalMode(mode), onLogout: handleLogout }),
      h('div', { className: 'app-main' },
        h(Sidebar, { activeTab, setActiveTab: (tab) => { setSelectedStock(null); setActiveTab(tab); }, user }),
        h('main', { className: 'content-area' },
          selectedStock ? h(StockDetail, {
            stock: selectedStock,
            onBack: () => setSelectedStock(null),
            onOpenTrade: handleOpenTradeModal,
            onToggleWatchlist: handleToggleWatchlist,
            isWatchlisted: watchlist.some(w => w.symbol === selectedStock.symbol)
          }) : h('React.Fragment', null,
            activeTab === 'dashboard' && h(Dashboard, { user, portfolioSummary, stocks, marketSummary, onSelectStock: (s) => setSelectedStock(s), onOpenTrade: handleOpenTradeModal }),
            activeTab === 'market' && h(StockMarket, { stocks, watchlist, onSelectStock: (s) => setSelectedStock(s), onOpenTrade: handleOpenTradeModal, onToggleWatchlist: handleToggleWatchlist }),
            activeTab === 'portfolio' && h(PortfolioView, { portfolio, summary: portfolioSummary, stocks, onSelectStock: (s) => setSelectedStock(s), onOpenTrade: handleOpenTradeModal }),
            activeTab === 'watchlist' && h(WatchlistView, { watchlist, stocks, onSelectStock: (s) => setSelectedStock(s), onOpenTrade: handleOpenTradeModal, onToggleWatchlist: handleToggleWatchlist }),
            activeTab === 'history' && h(TransactionsView, { transactions }),
            activeTab === 'admin' && h(AdminPanel, { stocks, onRefreshStocks: fetchStocks, showToast })
          )
        )
      ),
      tradeModalStock && h(TradeModal, {
        stock: tradeModalStock, initialType: tradeModalType, user, portfolio,
        onClose: () => setTradeModalStock(null), onExecuteTrade: handleTradeExecuted, showToast
      }),
      authModalMode && h(AuthModal, {
        mode: authModalMode, onClose: () => setAuthModalMode(null),
        onLoginSuccess: (u) => { setUser(u); fetchPortfolio(); fetchWatchlist(); fetchTransactions(); }, showToast
      }),
      h('div', { className: 'toast-container' },
        toasts.map(t => h('div', { key: t.id, className: `toast ${t.type}` },
          h('i', { className: `fa-solid fa-${t.type === 'success' ? 'circle-check' : t.type === 'error' ? 'circle-xmark' : 'circle-info'}` }),
          h('span', null, t.message)
        ))
      )
    );
  }

  // Mount React App
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(App));
})();
