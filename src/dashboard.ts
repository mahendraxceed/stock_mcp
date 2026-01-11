export function renderDashboard(ctx: {
  port: number;
  upstox: boolean;
  rupeezy: boolean;
  sessions: number;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stock MCP Server</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: { colors: { brand: '#6366f1' } } }
    }
  </script>
  <style>
    .tab-active { border-bottom: 2px solid #6366f1; color: #a5b4fc; }
    .tab-btn:hover { color: #c7d2fe; }
    .loading-spinner { border: 2px solid #374151; border-top-color: #6366f1; border-radius: 50%; width: 20px; height: 20px; animation: spin 0.6s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .pnl-positive { color: #34d399; }
    .pnl-negative { color: #f87171; }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">

  <!-- Header -->
  <header class="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">S</div>
        <h1 class="text-xl font-semibold">Stock MCP Server</h1>
      </div>
      <div class="flex items-center gap-4 text-sm text-gray-400">
        <span>SSE Sessions: <span id="sessionCount" class="text-gray-200 font-medium">${ctx.sessions}</span></span>
        <a href="/auth/status" target="_blank" class="hover:text-gray-200 transition">API Status</a>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="border-b border-gray-800 bg-gray-900/50">
    <div class="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
      <button onclick="switchTab('dashboard')" class="tab-btn tab-active px-5 py-3 text-sm font-medium text-gray-400 transition whitespace-nowrap" data-tab="dashboard">Dashboard</button>
      <button onclick="switchTab('portfolio')" class="tab-btn px-5 py-3 text-sm font-medium text-gray-400 transition whitespace-nowrap" data-tab="portfolio">Portfolio</button>
      <button onclick="switchTab('positions')" class="tab-btn px-5 py-3 text-sm font-medium text-gray-400 transition whitespace-nowrap" data-tab="positions">Positions</button>
      <button onclick="switchTab('funds')" class="tab-btn px-5 py-3 text-sm font-medium text-gray-400 transition whitespace-nowrap" data-tab="funds">Funds</button>
      <button onclick="switchTab('tools')" class="tab-btn px-5 py-3 text-sm font-medium text-gray-400 transition whitespace-nowrap" data-tab="tools">Tools</button>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto px-4 py-8">

    <!-- ════════════════ DASHBOARD TAB ════════════════ -->
    <div id="tab-dashboard" class="tab-content space-y-8">

      <!-- Broker Cards -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-gray-300">Broker Connections</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full ${ctx.upstox ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}"></div>
                <span class="font-medium text-lg">Upstox</span>
              </div>
              <span class="text-xs px-2 py-1 rounded-full ${ctx.upstox ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}">${ctx.upstox ? "Connected" : "Disconnected"}</span>
            </div>
            <p class="text-sm text-gray-500 mb-4">Indian equity, F&O, and commodity trading via Upstox APIs.</p>
            ${ctx.upstox
              ? '<button disabled class="w-full py-2 rounded-lg bg-gray-800 text-gray-500 text-sm cursor-not-allowed">Already Connected</button>'
              : '<a href="/auth/upstox" class="block w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-center text-sm font-medium transition">Connect Upstox</a>'}
          </div>
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full ${ctx.rupeezy ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}"></div>
                <span class="font-medium text-lg">Rupeezy</span>
              </div>
              <span class="text-xs px-2 py-1 rounded-full ${ctx.rupeezy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}">${ctx.rupeezy ? "Connected" : "Disconnected"}</span>
            </div>
            <p class="text-sm text-gray-500 mb-4">Indian equity and derivatives trading via Rupeezy Vortex APIs.</p>
            ${ctx.rupeezy
              ? '<button disabled class="w-full py-2 rounded-lg bg-gray-800 text-gray-500 text-sm cursor-not-allowed">Already Connected</button>'
              : '<a href="/auth/rupeezy" class="block w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-center text-sm font-medium transition">Connect Rupeezy</a>'}
          </div>
        </div>
      </section>

      <!-- MCP Config -->
      <section>
        <h2 class="text-lg font-semibold mb-4 text-gray-300">MCP Client Config</h2>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p class="text-sm text-gray-400 mb-3">Add this to your Claude Code / Cursor MCP config:</p>
          <pre class="bg-gray-950 border border-gray-800 rounded-lg p-4 text-sm text-indigo-300 overflow-x-auto"><code>{
  "mcpServers": {
    "stock-mcp": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:${ctx.port}/sse"]
    }
  }
}</code></pre>
        </div>
      </section>
    </div>

    <!-- ════════════════ PORTFOLIO TAB ════════════════ -->
    <div id="tab-portfolio" class="tab-content hidden space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-300">Portfolio Holdings</h2>
        <div class="flex items-center gap-3">
          <select id="pf-broker" onchange="loadPortfolio()" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="all">All Brokers</option>
            <option value="upstox">Upstox</option>
            <option value="rupeezy">Rupeezy</option>
          </select>
          <button onclick="loadPortfolio()" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Refresh</button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div id="pf-summary" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Total Holdings</p>
          <p id="pf-count" class="text-2xl font-bold">--</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Invested Value</p>
          <p id="pf-invested" class="text-2xl font-bold">--</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Current Value</p>
          <p id="pf-current" class="text-2xl font-bold">--</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Total P&L</p>
          <p id="pf-pnl" class="text-2xl font-bold">--</p>
        </div>
      </div>

      <!-- Holdings Table -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div id="pf-loading" class="p-8 text-center text-gray-500">
          <p>Select a broker and click Refresh to load holdings</p>
        </div>
        <div id="pf-table-wrap" class="hidden overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th class="text-left px-4 py-3">Symbol</th>
                <th class="text-left px-4 py-3">Broker</th>
                <th class="text-right px-4 py-3">Qty</th>
                <th class="text-right px-4 py-3">Avg Price</th>
                <th class="text-right px-4 py-3">LTP</th>
                <th class="text-right px-4 py-3">Invested</th>
                <th class="text-right px-4 py-3">Current</th>
                <th class="text-right px-4 py-3">P&L</th>
                <th class="text-right px-4 py-3">P&L %</th>
              </tr>
            </thead>
            <tbody id="pf-tbody" class="divide-y divide-gray-800"></tbody>
          </table>
        </div>
        <div id="pf-error" class="hidden p-8 text-center text-red-400"></div>
      </div>
    </div>

    <!-- ════════════════ POSITIONS TAB ════════════════ -->
    <div id="tab-positions" class="tab-content hidden space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-300">Open Positions</h2>
        <div class="flex items-center gap-3">
          <select id="pos-broker" onchange="loadPositions()" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="all">All Brokers</option>
            <option value="upstox">Upstox</option>
            <option value="rupeezy">Rupeezy</option>
          </select>
          <button onclick="loadPositions()" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Refresh</button>
        </div>
      </div>

      <!-- Positions Summary -->
      <div id="pos-summary" class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Open Positions</p>
          <p id="pos-count" class="text-2xl font-bold">--</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Total P&L</p>
          <p id="pos-pnl" class="text-2xl font-bold">--</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p class="text-xs text-gray-500 mb-1">Day P&L</p>
          <p id="pos-daypnl" class="text-2xl font-bold">--</p>
        </div>
      </div>

      <!-- Positions Table -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div id="pos-loading" class="p-8 text-center text-gray-500">
          <p>Select a broker and click Refresh to load positions</p>
        </div>
        <div id="pos-table-wrap" class="hidden overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th class="text-left px-4 py-3">Symbol</th>
                <th class="text-left px-4 py-3">Broker</th>
                <th class="text-left px-4 py-3">Product</th>
                <th class="text-right px-4 py-3">Qty</th>
                <th class="text-right px-4 py-3">Avg Price</th>
                <th class="text-right px-4 py-3">LTP</th>
                <th class="text-right px-4 py-3">P&L</th>
                <th class="text-right px-4 py-3">Day P&L</th>
              </tr>
            </thead>
            <tbody id="pos-tbody" class="divide-y divide-gray-800"></tbody>
          </table>
        </div>
        <div id="pos-empty" class="hidden p-8 text-center text-gray-500">No open positions</div>
        <div id="pos-error" class="hidden p-8 text-center text-red-400"></div>
      </div>
    </div>

    <!-- ════════════════ FUNDS TAB ════════════════ -->
    <div id="tab-funds" class="tab-content hidden space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-300">Account Funds</h2>
        <div class="flex items-center gap-3">
          <select id="funds-broker-sel" onchange="loadFunds()" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="all">All Brokers</option>
            <option value="upstox">Upstox</option>
            <option value="rupeezy">Rupeezy</option>
          </select>
          <button onclick="loadFunds()" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Refresh</button>
        </div>
      </div>

      <div id="funds-loading" class="p-8 text-center text-gray-500">
        <p>Select a broker and click Refresh to load funds</p>
      </div>
      <div id="funds-cards" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4"></div>
      <div id="funds-error" class="hidden p-8 text-center text-red-400 bg-gray-900 border border-gray-800 rounded-xl"></div>
    </div>

    <!-- ════════════════ TOOLS TAB ════════════════ -->
    <div id="tab-tools" class="tab-content hidden space-y-8">

      <section>
        <h2 class="text-lg font-semibold mb-4 text-gray-300">Test Tools</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <!-- Get Portfolio -->
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-indigo-400 text-lg">&#128188;</span>
              <h3 class="font-semibold">get_portfolio</h3>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex-1">Fetch long-term holdings from your brokerage accounts.</p>
            <div class="space-y-2">
              <select id="portfolio-broker" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="all">All Brokers</option>
                <option value="upstox">Upstox</option>
                <option value="rupeezy">Rupeezy</option>
              </select>
              <button onclick="runTool('portfolio')" class="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Run</button>
            </div>
          </div>

          <!-- Get Positions -->
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-amber-400 text-lg">&#128200;</span>
              <h3 class="font-semibold">get_positions</h3>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex-1">Fetch current open intraday &amp; delivery positions.</p>
            <div class="space-y-2">
              <select id="positions-broker" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="all">All Brokers</option>
                <option value="upstox">Upstox</option>
                <option value="rupeezy">Rupeezy</option>
              </select>
              <button onclick="runTool('positions')" class="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Run</button>
            </div>
          </div>

          <!-- Get Funds -->
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-emerald-400 text-lg">&#128176;</span>
              <h3 class="font-semibold">get_funds</h3>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex-1">Get account balance, margin, and collateral info.</p>
            <div class="space-y-2">
              <select id="funds-broker" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="all">All Brokers</option>
                <option value="upstox">Upstox</option>
                <option value="rupeezy">Rupeezy</option>
              </select>
              <button onclick="runTool('funds')" class="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Run</button>
            </div>
          </div>

          <!-- Analyze Portfolio -->
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-purple-400 text-lg">&#128202;</span>
              <h3 class="font-semibold">analyze_portfolio</h3>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex-1">P&amp;L, diversification score, top gainers/losers, concentration risk.</p>
            <div class="space-y-2">
              <select id="analysis-broker" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="all">All Brokers</option>
                <option value="upstox">Upstox</option>
                <option value="rupeezy">Rupeezy</option>
              </select>
              <button onclick="runTool('analysis')" class="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Run</button>
            </div>
          </div>

          <!-- Get Stock Quote -->
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-cyan-400 text-lg">&#128178;</span>
              <h3 class="font-semibold">get_stock_quote</h3>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex-1">Real-time LTP, OHLC, volume, and change%.</p>
            <div class="space-y-2">
              <input id="quote-instruments" type="text" placeholder="NSE_EQ|INE002A01018" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <select id="quote-broker" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="upstox">Upstox</option>
                <option value="rupeezy">Rupeezy</option>
              </select>
              <button onclick="runTool('quote')" class="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Run</button>
            </div>
          </div>

          <!-- Get Historical Data -->
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-orange-400 text-lg">&#128197;</span>
              <h3 class="font-semibold">get_historical_data</h3>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex-1">Historical OHLCV candle data.</p>
            <div class="space-y-2">
              <input id="history-instrument" type="text" placeholder="NSE_EQ|INE002A01018" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <select id="history-interval" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="1hour">1 Hour</option>
                <option value="15minute">15 Min</option>
                <option value="5minute">5 Min</option>
              </select>
              <div class="grid grid-cols-2 gap-2">
                <input id="history-from" type="date" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <input id="history-to" type="date" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <select id="history-broker" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="upstox">Upstox</option>
                <option value="rupeezy">Rupeezy</option>
              </select>
              <button onclick="runTool('history')" class="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition">Run</button>
            </div>
          </div>

        </div>
      </section>

      <!-- Response Panel -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-300">Response</h2>
          <button onclick="clearResponse()" class="text-xs text-gray-500 hover:text-gray-300 transition">Clear</button>
        </div>
        <div id="response-panel" class="bg-gray-900 border border-gray-800 rounded-xl p-5 min-h-[120px]">
          <p id="response-placeholder" class="text-sm text-gray-600">Run a tool to see the response here...</p>
          <div id="response-meta" class="hidden mb-3">
            <div class="flex items-center gap-3 text-xs">
              <span id="response-tool" class="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full"></span>
              <span id="response-time" class="text-gray-500"></span>
              <span id="response-status" class="px-2 py-1 rounded-full"></span>
            </div>
          </div>
          <pre id="response-body" class="hidden text-sm text-gray-300 overflow-x-auto max-h-[500px] overflow-y-auto"><code></code></pre>
        </div>
      </section>
    </div>

  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-800 mt-12">
    <div class="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-600">
      Stock MCP Server v1.0.0 &middot; SSE endpoint: <code class="text-gray-500">http://localhost:${ctx.port}/sse</code>
    </div>
  </footer>

  <script>
    // ─── Tab Navigation ──────────────────────────────────────────────
    function switchTab(tab) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('tab-active'));
      document.getElementById('tab-' + tab).classList.remove('hidden');
      document.querySelector('[data-tab="' + tab + '"]').classList.add('tab-active');

      // Auto-load data when switching tabs
      if (tab === 'portfolio') loadPortfolio();
      if (tab === 'positions') loadPositions();
      if (tab === 'funds') loadFunds();
    }

    // ─── Number Formatting ───────────────────────────────────────────
    function fmt(n) {
      if (n == null || isNaN(n)) return '--';
      return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    }

    function pnlClass(n) {
      if (n > 0) return 'pnl-positive';
      if (n < 0) return 'pnl-negative';
      return 'text-gray-400';
    }

    function pnlSign(n) {
      return n > 0 ? '+' : '';
    }

    // ─── Portfolio ───────────────────────────────────────────────────
    async function loadPortfolio() {
      const broker = document.getElementById('pf-broker').value;
      const loading = document.getElementById('pf-loading');
      const tableWrap = document.getElementById('pf-table-wrap');
      const errorEl = document.getElementById('pf-error');

      loading.innerHTML = '<div class="loading-spinner"></div><p class="mt-2 text-sm">Loading holdings...</p>';
      loading.classList.remove('hidden');
      tableWrap.classList.add('hidden');
      errorEl.classList.add('hidden');

      try {
        const res = await fetch('/api/portfolio?broker=' + broker);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load portfolio');

        document.getElementById('pf-count').textContent = data.totalHoldings;
        document.getElementById('pf-invested').textContent = fmt(data.totalInvested);
        document.getElementById('pf-current').textContent = fmt(data.currentValue);
        const pnlEl = document.getElementById('pf-pnl');
        pnlEl.textContent = pnlSign(data.totalPnl) + fmt(data.totalPnl);
        pnlEl.className = 'text-2xl font-bold ' + pnlClass(data.totalPnl);

        const tbody = document.getElementById('pf-tbody');
        tbody.innerHTML = '';

        if (data.holdings.length === 0) {
          loading.innerHTML = '<p class="text-sm text-gray-500">No holdings found</p>';
          loading.classList.remove('hidden');
          return;
        }

        data.holdings.forEach(h => {
          const pnl = h.currentValue - h.investedValue;
          const pnlPct = h.investedValue > 0 ? ((pnl / h.investedValue) * 100) : 0;
          const row = document.createElement('tr');
          row.className = 'hover:bg-gray-800/50 transition';
          row.innerHTML =
            '<td class="px-4 py-3 font-medium">' + (h.tradingSymbol || h.symbol) + '</td>' +
            '<td class="px-4 py-3 text-gray-400">' + h.broker + '</td>' +
            '<td class="px-4 py-3 text-right">' + h.quantity + '</td>' +
            '<td class="px-4 py-3 text-right">' + fmt(h.averagePrice) + '</td>' +
            '<td class="px-4 py-3 text-right">' + fmt(h.ltp) + '</td>' +
            '<td class="px-4 py-3 text-right">' + fmt(h.investedValue) + '</td>' +
            '<td class="px-4 py-3 text-right">' + fmt(h.currentValue) + '</td>' +
            '<td class="px-4 py-3 text-right ' + pnlClass(pnl) + '">' + pnlSign(pnl) + fmt(pnl) + '</td>' +
            '<td class="px-4 py-3 text-right ' + pnlClass(pnlPct) + '">' + pnlSign(pnlPct) + pnlPct.toFixed(2) + '%</td>';
          tbody.appendChild(row);
        });

        loading.classList.add('hidden');
        tableWrap.classList.remove('hidden');
      } catch (err) {
        loading.classList.add('hidden');
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      }
    }

    // ─── Positions ───────────────────────────────────────────────────
    async function loadPositions() {
      const broker = document.getElementById('pos-broker').value;
      const loading = document.getElementById('pos-loading');
      const tableWrap = document.getElementById('pos-table-wrap');
      const emptyEl = document.getElementById('pos-empty');
      const errorEl = document.getElementById('pos-error');

      loading.innerHTML = '<div class="loading-spinner"></div><p class="mt-2 text-sm">Loading positions...</p>';
      loading.classList.remove('hidden');
      tableWrap.classList.add('hidden');
      emptyEl.classList.add('hidden');
      errorEl.classList.add('hidden');

      try {
        const res = await fetch('/api/positions?broker=' + broker);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load positions');

        document.getElementById('pos-count').textContent = data.totalPositions;

        let totalPnl = 0;
        let dayPnl = 0;
        (data.positions || []).forEach(p => {
          totalPnl += (p.pnl || 0);
          dayPnl += (p.dayPnl || p.pnl || 0);
        });

        const pnlEl = document.getElementById('pos-pnl');
        pnlEl.textContent = pnlSign(totalPnl) + fmt(totalPnl);
        pnlEl.className = 'text-2xl font-bold ' + pnlClass(totalPnl);

        const dayPnlEl = document.getElementById('pos-daypnl');
        dayPnlEl.textContent = pnlSign(dayPnl) + fmt(dayPnl);
        dayPnlEl.className = 'text-2xl font-bold ' + pnlClass(dayPnl);

        if (data.positions.length === 0) {
          loading.classList.add('hidden');
          emptyEl.classList.remove('hidden');
          return;
        }

        const tbody = document.getElementById('pos-tbody');
        tbody.innerHTML = '';

        data.positions.forEach(p => {
          const row = document.createElement('tr');
          row.className = 'hover:bg-gray-800/50 transition';
          row.innerHTML =
            '<td class="px-4 py-3 font-medium">' + (p.tradingSymbol || p.symbol) + '</td>' +
            '<td class="px-4 py-3 text-gray-400">' + p.broker + '</td>' +
            '<td class="px-4 py-3 text-gray-400">' + (p.product || '--') + '</td>' +
            '<td class="px-4 py-3 text-right">' + (p.quantity || 0) + '</td>' +
            '<td class="px-4 py-3 text-right">' + fmt(p.averagePrice) + '</td>' +
            '<td class="px-4 py-3 text-right">' + fmt(p.ltp) + '</td>' +
            '<td class="px-4 py-3 text-right ' + pnlClass(p.pnl) + '">' + pnlSign(p.pnl || 0) + fmt(p.pnl) + '</td>' +
            '<td class="px-4 py-3 text-right ' + pnlClass(p.dayPnl) + '">' + pnlSign(p.dayPnl || 0) + fmt(p.dayPnl || p.pnl) + '</td>';
          tbody.appendChild(row);
        });

        loading.classList.add('hidden');
        tableWrap.classList.remove('hidden');
      } catch (err) {
        loading.classList.add('hidden');
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      }
    }

    // ─── Funds ───────────────────────────────────────────────────────
    async function loadFunds() {
      const broker = document.getElementById('funds-broker-sel').value;
      const loading = document.getElementById('funds-loading');
      const cards = document.getElementById('funds-cards');
      const errorEl = document.getElementById('funds-error');

      loading.innerHTML = '<div class="loading-spinner"></div><p class="mt-2 text-sm">Loading funds...</p>';
      loading.classList.remove('hidden');
      cards.classList.add('hidden');
      errorEl.classList.add('hidden');

      try {
        const res = await fetch('/api/funds?broker=' + broker);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load funds');

        // data can be a single fund object or an array
        const fundsList = Array.isArray(data) ? data : [data];
        cards.innerHTML = '';

        fundsList.forEach(f => {
          const card = document.createElement('div');
          card.className = 'bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4';
          card.innerHTML =
            '<div class="flex items-center justify-between mb-2">' +
              '<h3 class="text-lg font-semibold">' + (f.broker || broker).charAt(0).toUpperCase() + (f.broker || broker).slice(1) + '</h3>' +
              '<span class="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full">Funds</span>' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-4">' +
              '<div>' +
                '<p class="text-xs text-gray-500 mb-1">Available Margin</p>' +
                '<p class="text-xl font-bold text-emerald-400">' + fmt(f.availableMargin) + '</p>' +
              '</div>' +
              '<div>' +
                '<p class="text-xs text-gray-500 mb-1">Used Margin</p>' +
                '<p class="text-xl font-bold text-amber-400">' + fmt(f.usedMargin) + '</p>' +
              '</div>' +
              '<div>' +
                '<p class="text-xs text-gray-500 mb-1">Total Balance</p>' +
                '<p class="text-xl font-bold">' + fmt(f.totalBalance) + '</p>' +
              '</div>' +
              '<div>' +
                '<p class="text-xs text-gray-500 mb-1">Collateral</p>' +
                '<p class="text-xl font-bold text-purple-400">' + fmt(f.collateral) + '</p>' +
              '</div>' +
            '</div>';
          cards.appendChild(card);
        });

        loading.classList.add('hidden');
        cards.classList.remove('hidden');
      } catch (err) {
        loading.classList.add('hidden');
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      }
    }

    // ─── Tool Testing (JSON panel) ───────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30*86400000).toISOString().split('T')[0];
    document.getElementById('history-from').value = monthAgo;
    document.getElementById('history-to').value = today;

    function showResponse(tool, data, ms, isError) {
      document.getElementById('response-placeholder').classList.add('hidden');
      const meta = document.getElementById('response-meta');
      const body = document.getElementById('response-body');
      meta.classList.remove('hidden');
      body.classList.remove('hidden');

      document.getElementById('response-tool').textContent = tool;
      document.getElementById('response-time').textContent = ms + 'ms';
      const statusEl = document.getElementById('response-status');
      statusEl.textContent = isError ? 'Error' : 'Success';
      statusEl.className = 'px-2 py-1 rounded-full ' + (isError ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400');
      body.querySelector('code').textContent = JSON.stringify(data, null, 2);
    }

    function clearResponse() {
      document.getElementById('response-placeholder').classList.remove('hidden');
      document.getElementById('response-meta').classList.add('hidden');
      document.getElementById('response-body').classList.add('hidden');
    }

    async function runTool(tool) {
      const start = Date.now();
      let url = '';
      let params = {};

      switch (tool) {
        case 'portfolio':
          params = { broker: document.getElementById('portfolio-broker').value };
          url = '/api/portfolio';
          break;
        case 'positions':
          params = { broker: document.getElementById('positions-broker').value };
          url = '/api/positions';
          break;
        case 'funds':
          params = { broker: document.getElementById('funds-broker').value };
          url = '/api/funds';
          break;
        case 'analysis':
          params = { broker: document.getElementById('analysis-broker').value };
          url = '/api/analysis';
          break;
        case 'quote':
          params = {
            instruments: document.getElementById('quote-instruments').value,
            broker: document.getElementById('quote-broker').value,
          };
          url = '/api/quote';
          break;
        case 'history':
          params = {
            instrument: document.getElementById('history-instrument').value,
            interval: document.getElementById('history-interval').value,
            from: document.getElementById('history-from').value,
            to: document.getElementById('history-to').value,
            broker: document.getElementById('history-broker').value,
          };
          url = '/api/history';
          break;
      }

      const qs = new URLSearchParams(params).toString();
      try {
        showResponse(tool, { loading: true }, '...', false);
        const res = await fetch(url + '?' + qs);
        const data = await res.json();
        const ms = Date.now() - start;
        showResponse(tool, data, ms, !res.ok);
      } catch (err) {
        const ms = Date.now() - start;
        showResponse(tool, { error: err.message }, ms, true);
      }
    }
  </script>
</body>
</html>`;
}
