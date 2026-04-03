const API_BASE_URL = window.location.origin;

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

function renderSummary(data) {
  const el = document.getElementById('summary');
  el.innerHTML = `
    <div class="stat-item"><span class="stat-label">Total Sessions:</span> <span class="stat-value">${data.total_sessions}</span></div>
    <div class="stat-item"><span class="stat-label">Words:</span> <span class="stat-value">${data.words_recognized}</span></div>
    <div class="stat-item"><span class="stat-label">Signs:</span> <span class="stat-value">${data.signs_played}</span></div>
    <div class="stat-item"><span class="stat-label">Fingerspelled:</span> <span class="stat-value">${data.fingerspelled_words}</span></div>
    <div class="stat-item"><span class="stat-label">Pauses:</span> <span class="stat-value">${data.pauses}</span></div>
    <div class="stat-item"><span class="stat-label">Resumes:</span> <span class="stat-value">${data.resumes}</span></div>
  `;
}

function renderTopMissingWords(items) {
  const ul = document.getElementById('topMissingWords');
  ul.innerHTML = '';
  if (!items || items.length === 0) {
    ul.innerHTML = '<li>None yet</li>';
    return;
  }
  items.forEach(i => {
    const li = document.createElement('li');
    li.textContent = `${i.word} — ${i.count}`;
    ul.appendChild(li);
  });
}

function renderSessions(sessions) {
  const tbody = document.querySelector('#sessionsTable tbody');
  tbody.innerHTML = '';
  sessions.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.started_at || ''}</td>
      <td>${s.ended_at || ''}</td>
      <td>${s.mode || ''}</td>
      <td>${s.words_recognized ?? 0}</td>
      <td>${s.signs_played ?? 0}</td>
      <td>${s.fingerspelled_words ?? 0}</td>
      <td>${s.pauses ?? 0}</td>
      <td>${s.resumes ?? 0}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function main() {
  const results = await Promise.allSettled([
    fetchJson('/api/analytics/summary'),
    fetchJson('/api/analytics/top-missing-words?limit=10'),
    fetchJson('/api/analytics/sessions?limit=50')
  ]);

  const [summaryResult, missingResult, sessionsResult] = results;
  let failedSections = 0;

  if (summaryResult.status === 'fulfilled') {
    renderSummary(summaryResult.value);
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
    renderSessions(sessionsResult.value.sessions || []);
  } else {
    failedSections += 1;
    showLoadIssue('Some analytics sections could not be loaded.');
  }

  if (failedSections === results.length) {
    throw new Error(`Failed to load analytics from ${API_BASE_URL}`);
  }
}

main().catch(err => {
  console.error(err);
  alert(`Failed to load dashboard. Is the backend running at ${API_BASE_URL} ?`);
});
