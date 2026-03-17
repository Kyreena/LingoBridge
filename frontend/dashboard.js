const API_BASE_URL = 'http://localhost:5000';

async function fetchJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
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
  const s = await fetchJson('/api/analytics/summary');
  renderSummary(s);

  const m = await fetchJson('/api/analytics/top-missing-words?limit=10');
  renderTopMissingWords(m.top_missing_words || []);

  const sess = await fetchJson('/api/analytics/sessions?limit=50');
  renderSessions(sess.sessions || []);
}

main().catch(err => {
  console.error(err);
  alert('Failed to load dashboard. Is the backend running at http://localhost:5000 ?');
});