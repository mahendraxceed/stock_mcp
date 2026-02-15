import type { DashboardContext } from "./index.js";

export function renderLayout(
  ctx: DashboardContext,
  content: string,
  scripts: string
): string {
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
    ${content}
  </main>

  <!-- Footer -->
  <footer class="border-t border-gray-800 mt-12">
    <div class="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-600">
      Stock MCP Server v1.0.0 &middot; SSE endpoint: <code class="text-gray-500">http://localhost:${ctx.port}/sse</code>
    </div>
  </footer>

  ${scripts}
</body>
</html>`;
}
