# script.js — 3 Small Changes Required

These are the only changes you need to make to your existing `script.js`.  
Everything else stays exactly as it is.

---

## CHANGE 1 — Add two DOM references (near line 85–87)

Find this block in your script.js:

```js
const wordCount  = document.getElementById('wordCount');
const signCount  = document.getElementById('signCount');
const totalSigns = document.getElementById('totalSigns');
```

**ADD these two lines immediately after:**

```js
const serverDot   = document.getElementById('serverDot');
const serverLabel = document.getElementById('serverLabel');
```

---

## CHANGE 2 — Replace `checkServerHealth()` (around line 1393)

Find the entire function:

```js
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    totalSigns.textContent = data.total_signs || 0;
    updateStatus('✅ Connected to server', 'success');
  } catch (error) {
    console.error('Server not reachable:', error);
    updateStatus('⚠️ Backend server not connected', 'warning');
    totalSigns.textContent = '⚠️';
  }
}
```

**REPLACE the whole function with:**

```js
async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    totalSigns.textContent = data.total_signs || 0;

    // Green dot + label
    if (serverDot)   serverDot.className   = 'server-dot server-dot--connected';
    if (serverLabel) { serverLabel.textContent = 'Connected'; serverLabel.className = 'server-label server-label--connected'; }

    updateStatus('Ready', 'success');
  } catch (error) {
    console.error('Server not reachable:', error);

    // Red dot + label
    if (serverDot)   serverDot.className   = 'server-dot server-dot--disconnected';
    if (serverLabel) { serverLabel.textContent = 'Server offline'; serverLabel.className = 'server-label server-label--disconnected'; }

    updateStatus('Backend not connected — video signs unavailable', 'warning');
    totalSigns.textContent = '—';
  }
}
```

---

## CHANGE 3 — Replace `updateDarkModeIcon()` (around line 1425)

Find:

```js
function updateDarkModeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  darkModeToggle.textContent = isDark ? '☀️' : '🌙';
}
```

**REPLACE with:**

```js
function updateDarkModeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  // Icons are now SVGs shown/hidden via CSS — just update accessibility labels
  darkModeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  darkModeToggle.setAttribute('title',      isDark ? 'Switch to light mode' : 'Switch to dark mode');
}
```

> **Why?** The old version set `textContent`, which would delete the SVG icons
> inside the button. The new version only updates the tooltip/aria-label.
> The sun/moon swap is handled automatically by CSS (`.dark-mode .icon-sun`).

---

## Summary

| # | Location | Action |
|---|----------|--------|
| 1 | After `totalSigns` const (~line 87) | Add 2 const lines for `serverDot` / `serverLabel` |
| 2 | `checkServerHealth()` (~line 1393)  | Replace whole function |
| 3 | `updateDarkModeIcon()` (~line 1425) | Replace whole function |

That's it — 3 small targeted edits. No other changes to script.js needed.
