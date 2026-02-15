export function renderFundsTab(): string {
  return `
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
    </div>`;
}
