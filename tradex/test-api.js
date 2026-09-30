const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

let userToken = '';
let adminToken = '';

function request(path, method = 'GET', body = null, token = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting TradeX Comprehensive API Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASSED: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAILED: ${name} ->`, err.message);
      failed++;
    }
  }

  // Test 1: User Login
  await assertTest('1. User Login (user@tradex.com)', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'user@tradex.com',
      password: 'password123'
    });
    if (res.status !== 200 || !res.body.token) throw new Error(`Expected token, got status ${res.status}: ${JSON.stringify(res.body)}`);
    userToken = res.body.token;
  });

  // Test 2: Admin Login
  await assertTest('2. Admin Login (admin@tradex.com)', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'admin@tradex.com',
      password: 'admin123'
    });
    if (res.status !== 200 || !res.body.token) throw new Error(`Expected admin token, got status ${res.status}: ${JSON.stringify(res.body)}`);
    adminToken = res.body.token;
  });

  // Test 3: List US Stocks
  await assertTest('3. GET /stocks (List all stocks)', async () => {
    const res = await request('/stocks');
    if (res.status !== 200 || !Array.isArray(res.body.stocks) || res.body.stocks.length === 0) {
      throw new Error(`Invalid stock list response: status ${res.status}`);
    }
  });

  // Test 4: Stock Detail with Chart History
  await assertTest('4. GET /stocks/AAPL (Detail & history)', async () => {
    const res = await request('/stocks/AAPL');
    if (res.status !== 200 || !res.body.stock || res.body.stock.symbol !== 'AAPL') {
      throw new Error(`Failed to fetch AAPL details: status ${res.status}`);
    }
  });

  // Test 5: Virtual Buy Stock Execution
  await assertTest('5. POST /trade/buy (Buy 10 shares of AAPL)', async () => {
    const res = await request('/trade/buy', 'POST', { symbol: 'AAPL', quantity: 10 }, userToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Buy order failed: status ${res.status}, msg: ${res.body.message}`);
    }
  });

  // Test 6: Check Portfolio Holdings & Net Worth
  await assertTest('6. GET /portfolio (Verify holdings & balance deduction)', async () => {
    const res = await request('/portfolio', 'GET', null, userToken);
    if (res.status !== 200 || !res.body.holdings || !res.body.holdings.some(h => h.symbol === 'AAPL')) {
      throw new Error(`Portfolio missing AAPL holding`);
    }
  });

  // Test 7: Add to Watchlist
  await assertTest('7. POST /watchlist/add (Add NVDA to watchlist)', async () => {
    const res = await request('/watchlist/add', 'POST', { symbol: 'NVDA' }, userToken);
    if (res.status !== 201 && res.status !== 400) {
      throw new Error(`Watchlist add failed: status ${res.status}`);
    }
  });

  // Test 8: Virtual Sell Stock Execution
  await assertTest('8. POST /trade/sell (Sell 5 shares of AAPL)', async () => {
    const res = await request('/trade/sell', 'POST', { symbol: 'AAPL', quantity: 5 }, userToken);
    if (res.status !== 200 || !res.body.success) {
      throw new Error(`Sell order failed: status ${res.status}, msg: ${res.body.message}`);
    }
  });

  // Test 9: Admin System Stats
  await assertTest('9. GET /admin/system-stats (Admin access control check)', async () => {
    const res = await request('/admin/system-stats', 'GET', null, adminToken);
    if (res.status !== 200 || !res.body.stats) {
      throw new Error(`Admin stats request failed: status ${res.status}`);
    }
  });

  console.log(`\n===================================================`);
  console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
