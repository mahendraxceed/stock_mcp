export function renderToolsTab(): string {
  return `
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
    </div>`;
}
