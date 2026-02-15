export function renderScripts(): string {
  return `<script>
    // ─── Tab Navigation ──────────────────────────────────────────────
    function switchTab(tab) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('tab-active'));
      document.getElementById('tab-' + tab).classList.remove('hidden');
      document.querySelector('[data-tab="' + tab + '"]').classList.add('tab-active');

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
  </script>`;
}
