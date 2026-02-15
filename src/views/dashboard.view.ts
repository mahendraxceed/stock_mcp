import type { DashboardContext } from "./index.js";

export function renderDashboardTab(ctx: DashboardContext): string {
  return `
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
    </div>`;
}
