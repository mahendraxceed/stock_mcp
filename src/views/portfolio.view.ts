export function renderPortfolioTab(): string {
  return `
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
    </div>`;
}
