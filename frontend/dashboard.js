const API_BASE_URL = window.location.origin;
const DASHBOARD_EMPTY_STATE =
  '<div class="chart-empty">No analytics yet. Run a few live or demo sessions to populate this view.</div>';
const SESSIONS_PER_PAGE = 10;

let allSessions = [];
let activeSessionFilter = 'all';
let activeDateRange = '7';
let currentSessionsPage = 1;
let activeSessionSearch = '';

async function fetchJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function showLoadIssue(message) {
  const existing = document.getElementById('dashboardNotice');
  if (existing) {
    existing.textContent = message;
    return;
  }

  const notice = document.createElement('div');
  notice.id = 'dashboardNotice';
  notice.className = 'status status-warning';
  notice.textContent = message;
  document.querySelector('main')?.prepend(notice);
}

function formatCompactNumber(value) {
  return Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value || 0);
}

function formatPercent(value) {
  return `${Math.round(value || 0)}%`;
}

function getPerformanceBand(value, thresholds) {
  const [strong, steady] = thresholds;
  if (value >= strong) return 'strong';
  if (value >= steady) return 'steady';
  return 'attention';
}

function getPerformanceLabel(band) {
  if (band === 'strong') return 'Good';
  if (band === 'steady') return 'Okay';
  return 'Needs focus';
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSummary(data) {
  const el = document.getElementById('summary');
  const signCoverage = data.words_recognized > 0
    ? (data.signs_played / data.words_recognized) * 100
    : 0;
  const fingerspellRate = data.words_recognized > 0
    ? (data.fingerspelled_words / data.words_recognized) * 100
    : 0;
  const avgWordsPerSession = data.total_sessions > 0
    ? data.words_recognized / data.total_sessions
    : 0;
  const coverageBand = getPerformanceBand(signCoverage, [75, 45]);
  const fingerspellBand = getPerformanceBand(100 - fingerspellRate, [85, 60]);
  const sessionBand = getPerformanceBand(avgWordsPerSession, [40, 15]);
  const pauseRecoveryRate = data.pauses === 0
    ? 100
    : Math.min(100, (data.resumes / Math.max(data.pauses, 1)) * 100);
  const pauseBand = getPerformanceBand(pauseRecoveryRate, [90, 60]);

  el.innerHTML = `
    <article class="summary-card summary-card-primary">
      <span class="summary-label">Total Sessions</span>
      <strong class="summary-value">${formatCompactNumber(data.total_sessions)}</strong>
      <span class="summary-meta">Tracked across demo and live use</span>
    </article>
    <article class="summary-card summary-card-band band-${sessionBand}">
      <span class="summary-label">Words Recognized</span>
      <strong class="summary-value">${formatCompactNumber(data.words_recognized)}</strong>
      <span class="summary-band">${getPerformanceLabel(sessionBand)}</span>
      <span class="summary-meta">${Math.round(avgWordsPerSession)} average per session</span>
    </article>
    <article class="summary-card summary-card-band band-${coverageBand}">
      <span class="summary-label">Signs Played</span>
      <strong class="summary-value">${formatCompactNumber(data.signs_played)}</strong>
      <span class="summary-band">${getPerformanceLabel(coverageBand)}</span>
      <span class="summary-meta">${formatPercent(signCoverage)} sign coverage</span>
    </article>
    <article class="summary-card summary-card-band band-${fingerspellBand}">
      <span class="summary-label">Fingerspelled</span>
      <strong class="summary-value">${formatCompactNumber(data.fingerspelled_words)}</strong>
      <span class="summary-band">${getPerformanceLabel(fingerspellBand)}</span>
      <span class="summary-meta">${formatPercent(fingerspellRate)} of recognized words</span>
    </article>
    <article class="summary-card summary-card-band band-${pauseBand}">
      <span class="summary-label">Pause Recovery</span>
      <strong class="summary-value">${formatPercent(pauseRecoveryRate)}</strong>
      <span class="summary-band">${getPerformanceLabel(pauseBand)}</span>
      <span class="summary-meta">${data.resumes} resumed after ${data.pauses} pauses</span>
    </article>
    <article class="summary-card">
      <span class="summary-label">Resumes</span>
      <strong class="summary-value">${formatCompactNumber(data.resumes)}</strong>
      <span class="summary-meta">Sessions brought back into flow</span>
    </article>
  `;
}

function renderPriorityWords(sessions) {
  const panel = document.getElementById('priorityWordsPanel');
  const list = Array.isArray(sessions) ? sessions.slice(0, 8) : [];

  if (list.length === 0) {
    panel.innerHTML = DASHBOARD_EMPTY_STATE;
    return;
  }

  const recentCounts = new Map();
  list.forEach((session) => {
    (session.missing_words || []).forEach((item) => {
      const key = String(item.word || '').trim().toLowerCase();
      if (!key) return;
      recentCounts.set(key, (recentCounts.get(key) || 0) + Number(item.count || 0));
    });
  });

  const priorities = Array.from(recentCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 8);

  if (priorities.length === 0) {
    panel.innerHTML = `
      <div class="priority-empty">
        Recent sessions are resolving cleanly right now. No urgent new words to source.
      </div>
    `;
    return;
  }

  const maxCount = Math.max(...priorities.map((item) => item.count), 1);
  panel.innerHTML = `
    <div class="priority-list">
      ${priorities.map((item, index) => {
        const intensity = Math.max(18, Math.round((item.count / maxCount) * 100));
        return `
          <article class="priority-item">
            <div class="priority-topline">
              <span class="priority-rank">#${index + 1}</span>
              <span class="priority-word">${escapeHtml(item.word)}</span>
              <span class="priority-count">${item.count}</span>
            </div>
            <div class="priority-meter">
              <span class="priority-fill" style="width:${intensity}%"></span>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderTopMissingWords(items) {
  const chart = document.getElementById('missingWordsChart');

  if (!items || items.length === 0) {
    chart.innerHTML = DASHBOARD_EMPTY_STATE;
    return;
  }

  const maxCount = Math.max(...items.map(item => item.count), 1);
  chart.innerHTML = items.slice(0, 8).map((item, index) => {
    const width = Math.max(14, Math.round((item.count / maxCount) * 100));
    return `
      <div class="bar-row">
        <div class="bar-label-group">
          <span class="bar-rank">#${index + 1}</span>
          <span class="bar-label">${escapeHtml(item.word)}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${width}%"></div>
        </div>
        <span class="bar-value">${item.count}</span>
      </div>
    `;
  }).join('');
}

function renderSessionActivity(sessions, summaryData) {
  const chart = document.getElementById('sessionActivity');
  const highlights = document.getElementById('sessionHighlights');
  const list = Array.isArray(sessions) ? sessions : [];

  if (list.length === 0) {
    chart.innerHTML = DASHBOARD_EMPTY_STATE;
    highlights.innerHTML = `
      <div class="mini-stat">
        <span class="mini-stat-label">Waiting for activity</span>
        <strong class="mini-stat-value">0</strong>
      </div>
    `;
    return;
  }

  const recent = list.slice(0, 8).reverse();
  const maxBarValue = Math.max(
    ...recent.flatMap(session => [
      Number(session.words_recognized ?? 0),
      Number(session.signs_played ?? 0),
      Number(session.fingerspelled_words ?? 0)
    ]),
    1
  );

  chart.innerHTML = `
    <div class="session-chart-grid">
      ${recent.map((session, index) => {
        const words = Number(session.words_recognized ?? 0);
        const signs = Number(session.signs_played ?? 0);
        const fingerspelled = Number(session.fingerspelled_words ?? 0);
        const label = formatDateTime(session.started_at);

        return `
          <div class="session-cluster" aria-label="Session ${index + 1}">
            <div class="session-bars">
              <span class="session-bar words" style="height:${Math.max(8, (words / maxBarValue) * 100)}%" title="Words: ${words}"></span>
              <span class="session-bar signs" style="height:${Math.max(8, (signs / maxBarValue) * 100)}%" title="Signs: ${signs}"></span>
              <span class="session-bar fingerspelled" style="height:${Math.max(8, (fingerspelled / maxBarValue) * 100)}%" title="Fingerspelled: ${fingerspelled}"></span>
            </div>
            <div class="session-meta">
              <span class="session-mode mode-${escapeHtml(session.mode || 'unknown')}">${escapeHtml(session.mode || 'unknown')}</span>
              <span class="session-label">${escapeHtml(label)}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="chart-legend">
      <span><i class="legend-swatch words"></i>Words</span>
      <span><i class="legend-swatch signs"></i>Signs</span>
      <span><i class="legend-swatch fingerspelled"></i>Fingerspelled</span>
    </div>
  `;

  const totalsFromSessions = list.reduce((totals, session) => {
    totals.words += Number(session.words_recognized ?? 0);
    totals.signs += Number(session.signs_played ?? 0);
    return totals;
  }, { words: 0, signs: 0 });
  const totalSessions = summaryData?.total_sessions || list.length;
  const totalWords = summaryData?.words_recognized ?? totalsFromSessions.words;
  const totalSigns = summaryData?.signs_played ?? totalsFromSessions.signs;
  const avgWords = totalSessions > 0 ? totalWords / totalSessions : 0;
  const avgSigns = totalSessions > 0 ? totalSigns / totalSessions : 0;
  const liveSessions = list.filter(session => String(session.mode || '').toLowerCase() === 'live').length;
  const demoSessions = list.filter(session => String(session.mode || '').toLowerCase() === 'demo').length;
  const busiest = list.reduce((best, session) => {
    const currentScore = Number(session.words_recognized ?? 0) + Number(session.signs_played ?? 0);
    const bestScore = best
      ? Number(best.words_recognized ?? 0) + Number(best.signs_played ?? 0)
      : -1;
    return currentScore > bestScore ? session : best;
  }, null);

  highlights.innerHTML = `
    <div class="mini-stat">
      <span class="mini-stat-label">Average words / session</span>
      <strong class="mini-stat-value">${Math.round(avgWords)}</strong>
    </div>
    <div class="mini-stat">
      <span class="mini-stat-label">Average signs / session</span>
      <strong class="mini-stat-value">${Math.round(avgSigns)}</strong>
    </div>
    <div class="mini-stat">
      <span class="mini-stat-label">Live vs demo</span>
      <strong class="mini-stat-value">${liveSessions} / ${demoSessions}</strong>
    </div>
    <div class="mini-stat">
      <span class="mini-stat-label">Busiest session</span>
      <strong class="mini-stat-value">${busiest ? formatDateTime(busiest.started_at) : '-'}</strong>
    </div>
  `;
}

function renderMissingWordTags(items) {
  if (!items || items.length === 0) {
    return '<span class="session-missing-none">None</span>';
  }

  return `
    <div class="session-missing-list">
      ${items.map((item) => `
        <span class="session-missing-tag">
          ${escapeHtml(item.word)}
          <strong>${item.count}</strong>
        </span>
      `).join('')}
    </div>
  `;
}

function renderMissingWordDetailList(items) {
  if (!items || items.length === 0) {
    return '<p class="session-detail-empty">No fingerspelled words were logged for this session.</p>';
  }

  return `
    <div class="session-detail-list">
      ${items.map((item) => `
        <div class="session-detail-item">
          <span class="session-detail-word">${escapeHtml(item.word)}</span>
          <span class="session-detail-count">${item.count}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function getFilteredSessions() {
  let filtered = allSessions;

  if (activeDateRange !== 'all') {
    const days = Number(activeDateRange);
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    filtered = filtered.filter((session) => {
      const timestamp = Date.parse(session.started_at || '');
      return !Number.isNaN(timestamp) && timestamp >= cutoff;
    });
  }

  if (activeSessionFilter === 'live') {
    filtered = filtered.filter((session) => String(session.mode || '').toLowerCase() === 'live');
  }

  if (activeSessionFilter === 'demo') {
    filtered = filtered.filter((session) => String(session.mode || '').toLowerCase() === 'demo');
  }

  if (activeSessionFilter === 'fingerspelled') {
    filtered = filtered.filter((session) => Array.isArray(session.missing_words) && session.missing_words.length > 0);
  }

  if (activeSessionSearch) {
    const query = activeSessionSearch.toLowerCase();
    filtered = filtered.filter((session) => {
      const mode = String(session.mode || '').toLowerCase();
      const missingWords = (session.missing_words || []).map((item) => String(item.word || '').toLowerCase());
      return mode.includes(query) || missingWords.some((word) => word.includes(query));
    });
  }

  return filtered;
}

function getPagedSessions(filteredSessions) {
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / SESSIONS_PER_PAGE));
  currentSessionsPage = Math.min(currentSessionsPage, totalPages);
  const startIndex = (currentSessionsPage - 1) * SESSIONS_PER_PAGE;
  const endIndex = startIndex + SESSIONS_PER_PAGE;
  return {
    totalPages,
    startIndex,
    endIndex,
    items: filteredSessions.slice(startIndex, endIndex)
  };
}

function updateSessionToolbar(filteredSessions, paging) {
  const label = document.getElementById('sessionsPaginationLabel');
  const prevBtn = document.getElementById('sessionsPrevBtn');
  const nextBtn = document.getElementById('sessionsNextBtn');
  const rangeSelect = document.getElementById('sessionsDateRange');
  const searchInput = document.getElementById('sessionsSearchInput');

  if (label) {
    if (filteredSessions.length === 0) {
      label.textContent = 'Showing 0-0 of 0';
    } else {
      label.textContent = `Showing ${paging.startIndex + 1}-${Math.min(paging.endIndex, filteredSessions.length)} of ${filteredSessions.length}`;
    }
  }

  if (prevBtn) prevBtn.disabled = currentSessionsPage <= 1;
  if (nextBtn) nextBtn.disabled = currentSessionsPage >= paging.totalPages || filteredSessions.length === 0;

  document.querySelectorAll('.session-filter').forEach((button) => {
    const isActive = button.dataset.filter === activeSessionFilter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  if (rangeSelect && rangeSelect.value !== activeDateRange) {
    rangeSelect.value = activeDateRange;
  }

  if (searchInput && searchInput.value !== activeSessionSearch) {
    searchInput.value = activeSessionSearch;
  }
}

function renderSessionsTableRows(sessions) {
  const tbody = document.querySelector('#sessionsTable tbody');
  tbody.innerHTML = '';

  if (!sessions || sessions.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="8" class="table-empty">No sessions recorded yet.</td>';
    tbody.appendChild(tr);
    return;
  }

  sessions.forEach((session, index) => {
    const detailId = `session-detail-${index}`;
    const tr = document.createElement('tr');
    tr.className = 'session-row';
    tr.innerHTML = `
      <td>${escapeHtml(formatDateTime(session.started_at))}</td>
      <td>${escapeHtml(formatDateTime(session.ended_at))}</td>
      <td><span class="mode-pill mode-${escapeHtml(session.mode || 'unknown')}">${escapeHtml(session.mode || '')}</span></td>
      <td>${session.words_recognized ?? 0}</td>
      <td>${session.signs_played ?? 0}</td>
      <td>${session.pauses ?? 0}</td>
      <td>${session.resumes ?? 0}</td>
      <td>
        <button class="session-expand-btn" type="button" aria-expanded="false" aria-controls="${detailId}">
          Details
        </button>
      </td>
    `;
    tbody.appendChild(tr);

    const detailRow = document.createElement('tr');
    detailRow.id = detailId;
    detailRow.className = 'session-detail-row';
    detailRow.hidden = true;
    detailRow.innerHTML = `
      <td colspan="8" class="session-detail-cell">
        <div class="session-detail-card">
          <div class="session-detail-header">
            <h3>Fingerspelled words for this session</h3>
            <span class="session-detail-subtitle">Use this list when choosing the next signs to add.</span>
          </div>
          ${renderMissingWordDetailList(session.missing_words)}
        </div>
      </td>
    `;
    tbody.appendChild(detailRow);

    const button = tr.querySelector('.session-expand-btn');
    button?.addEventListener('click', () => {
      const isOpen = !detailRow.hidden;
      detailRow.hidden = isOpen;
      tr.classList.toggle('is-expanded', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
      button.textContent = isOpen ? 'Details' : 'Hide';
    });
  });
}

function renderSessions() {
  const filteredSessions = getFilteredSessions();
  const paging = getPagedSessions(filteredSessions);
  updateSessionToolbar(filteredSessions, paging);
  renderSessionsTableRows(paging.items);
}

function setupSessionControls() {
  document.querySelectorAll('.session-filter').forEach((button) => {
    button.addEventListener('click', () => {
      const nextFilter = button.dataset.filter || 'all';
      if (activeSessionFilter === nextFilter) return;
      activeSessionFilter = nextFilter;
      currentSessionsPage = 1;
      renderSessions();
    });
  });

  document.getElementById('sessionsPrevBtn')?.addEventListener('click', () => {
    if (currentSessionsPage <= 1) return;
    currentSessionsPage -= 1;
    renderSessions();
  });

  document.getElementById('sessionsNextBtn')?.addEventListener('click', () => {
    const filteredSessions = getFilteredSessions();
    const totalPages = Math.max(1, Math.ceil(filteredSessions.length / SESSIONS_PER_PAGE));
    if (currentSessionsPage >= totalPages) return;
    currentSessionsPage += 1;
    renderSessions();
  });

  document.getElementById('sessionsDateRange')?.addEventListener('change', (event) => {
    activeDateRange = event.target.value || '7';
    currentSessionsPage = 1;
    renderSessions();
  });

  document.getElementById('sessionsSearchInput')?.addEventListener('input', (event) => {
    activeSessionSearch = (event.target.value || '').trim();
    currentSessionsPage = 1;
    renderSessions();
  });
}

async function main() {
  const results = await Promise.allSettled([
    fetchJson('/api/analytics/summary'),
    fetchJson('/api/analytics/top-missing-words?limit=10'),
    fetchJson('/api/analytics/sessions?limit=50')
  ]);

  const [summaryResult, missingResult, sessionsResult] = results;
  const summaryData = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
  const sessionsData = sessionsResult.status === 'fulfilled'
    ? (sessionsResult.value.sessions || [])
    : [];
  let failedSections = 0;

  if (summaryData) {
    renderSummary(summaryData);
  } else {
    failedSections += 1;
    showLoadIssue('Some analytics sections could not be loaded.');
  }

  if (missingResult.status === 'fulfilled') {
    renderTopMissingWords(missingResult.value.top_missing_words || []);
  } else {
    failedSections += 1;
    renderTopMissingWords([]);
    showLoadIssue('Some analytics sections could not be loaded.');
  }

  if (sessionsResult.status === 'fulfilled') {
    allSessions = sessionsData;
    renderSessions();
    renderPriorityWords(sessionsData);
  } else {
    failedSections += 1;
    allSessions = [];
    renderSessions();
    renderPriorityWords([]);
    showLoadIssue('Some analytics sections could not be loaded.');
  }

  renderSessionActivity(sessionsData, summaryData);

  if (failedSections === results.length) {
    throw new Error(`Failed to load analytics from ${API_BASE_URL}`);
  }
}

setupSessionControls();

main().catch(err => {
  console.error(err);
  alert(`Failed to load dashboard. Is the backend running at ${API_BASE_URL} ?`);
});
