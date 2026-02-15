export function renderPositionsTab(): string {
  return `
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
    </div>`;
}
