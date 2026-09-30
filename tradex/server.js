const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const seedDatabase = require('./db/seed');
const marketSimulator = require('./utils/marketSimulator');

// Initialize database seed
seedDatabase();

let PORT = parseInt(process.env.PORT, 10) || 5000;

// Load Handler Modules
const authRoutes = require('./routes/auth');
const stocksRoutes = require('./routes/stocks');
const tradeRoutes = require('./routes/trade');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');
const adminRoutes = require('./routes/admin');

// Static Asset MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function createExpressShim(req, res, parsedUrl) {
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());
  req.params = {};

  res.json = function(data) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    }
  };

  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const parsedUrl = new url.URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  createExpressShim(req, res, parsedUrl);

  let bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));

  req.on('end', () => {
    const rawBody = Buffer.concat(bodyChunks).toString();
    if (rawBody && req.headers['content-type']?.includes('application/json')) {
      try {
        req.body = JSON.parse(rawBody);
      } catch (e) {
        req.body = {};
      }
    } else {
      req.body = {};
    }

    // Real-Time SSE Stream Endpoint
    if (pathname === '/api/stocks/live-stream' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      const onTick = (updated) => {
        res.write(`data: ${JSON.stringify(updated)}\n\n`);
      };

      marketSimulator.addListener(onTick);
      req.on('close', () => marketSimulator.removeListener(onTick));
      return;
    }

    // API Routing matching
    if (pathname.startsWith('/api/')) {
      return routeApi(req, res, pathname);
    }

    // Serve Static Files from public/
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(__dirname, 'public', 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.statusCode = 500;
        return res.end('Error loading page');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

function routeApi(req, res, pathname) {
  const method = req.method;

  // 1. AUTH ROUTES
  if (pathname === '/api/auth/register' && method === 'POST') {
    return authRoutes.handleRegister(req, res);
  }
  if (pathname === '/api/auth/login' && method === 'POST') {
    return authRoutes.handleLogin(req, res);
  }
  if (pathname === '/api/auth/me' && method === 'GET') {
    return authRoutes.handleMe(req, res);
  }

  // 2. STOCKS ROUTES
  if (pathname === '/api/stocks' && method === 'GET') {
    return stocksRoutes.handleGetStocks(req, res);
  }
  if (pathname === '/api/stocks/market-summary' && method === 'GET') {
    return stocksRoutes.handleMarketSummary(req, res);
  }
  if (pathname.startsWith('/api/stocks/') && method === 'GET') {
    const symbol = pathname.split('/')[3];
    return stocksRoutes.handleGetStockDetail(req, res, symbol);
  }

  // 3. TRADE ROUTES
  if (pathname === '/api/trade/buy' && method === 'POST') {
    return tradeRoutes.handleBuy(req, res);
  }
  if (pathname === '/api/trade/sell' && method === 'POST') {
    return tradeRoutes.handleSell(req, res);
  }
  if (pathname === '/api/trade/history' && method === 'GET') {
    return tradeRoutes.handleHistory(req, res);
  }

  // 4. PORTFOLIO ROUTES
  if (pathname === '/api/portfolio' && method === 'GET') {
    return portfolioRoutes.handleGetPortfolio(req, res);
  }

  // 5. WATCHLIST ROUTES
  if (pathname === '/api/watchlist' && method === 'GET') {
    return watchlistRoutes.handleGetWatchlist(req, res);
  }
  if (pathname === '/api/watchlist/add' && method === 'POST') {
    return watchlistRoutes.handleAddWatchlist(req, res);
  }
  if (pathname.startsWith('/api/watchlist/') && method === 'DELETE') {
    const symbol = pathname.split('/')[3];
    return watchlistRoutes.handleRemoveWatchlist(req, res, symbol);
  }

  // 6. ADMIN ROUTES
  if (pathname === '/api/admin/system-stats' && method === 'GET') {
    return adminRoutes.handleSystemStats(req, res);
  }
  if (pathname === '/api/admin/stocks' && method === 'POST') {
    return adminRoutes.handleAddStock(req, res);
  }
  if (pathname.startsWith('/api/admin/stocks/') && pathname.endsWith('/status') && method === 'PATCH') {
    const parts = pathname.split('/');
    const symbol = parts[4];
    return adminRoutes.handleToggleStatus(req, res, symbol);
  }
  if (pathname.startsWith('/api/admin/stocks/') && method === 'PUT') {
    const symbol = pathname.split('/')[4];
    return adminRoutes.handleUpdateStock(req, res, symbol);
  }
  if (pathname.startsWith('/api/admin/stocks/') && method === 'DELETE') {
    const symbol = pathname.split('/')[4];
    return adminRoutes.handleDeleteStock(req, res, symbol);
  }

  res.statusCode = 404;
  res.json({ success: false, message: `Route ${method} ${pathname} not found` });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use. Retrying on port ${PORT + 1}...`);
    PORT = PORT + 1;
    setTimeout(() => {
      server.listen(PORT);
    }, 500);
  } else {
    console.error('Server error:', err);
  }
});

function startServer() {
  server.listen(PORT, () => {
    console.log(`
  🚀 ===================================================
  📊 TradeX Stock Simulation Platform Server Running!
  🔗 URL: http://localhost:${PORT}
  🔑 Demo User Account: user@tradex.com / password123
  👑 Admin Account:     admin@tradex.com / admin123
  ===================================================
    `);
    marketSimulator.start();
  });
}

startServer();
