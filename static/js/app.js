/* ── SVG Icons as inline data for JS ── */
const ICONS = {
  tweet: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>`,
  calendar: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>`,
  chevron: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>`,
  external: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>`,
  up: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>`,
  refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>`,
};

// ── State ──
let allEntries = [];
let isLoading = false;

// ── DOM refs ──
const refreshBtn    = document.getElementById('refresh-btn');
const spinner       = document.getElementById('spinner');
const refreshIcon   = document.getElementById('refresh-icon');
const feedContainer = document.getElementById('feed-container');
const statsBar      = document.getElementById('stats-bar');
const countPill     = document.getElementById('count-pill');
const lastUpdated   = document.getElementById('last-updated');
const scrollTopBtn  = document.getElementById('scroll-top');
const modalOverlay  = document.getElementById('modal-overlay');
const tweetText     = document.getElementById('tweet-text');
const charCount     = document.getElementById('char-count');
const postTweetBtn  = document.getElementById('post-tweet-btn');

// ── Refresh button ──
refreshBtn.innerHTML = `${ICONS.refresh} <span class="label">Refresh</span>`;
refreshIcon.innerHTML = ICONS.refresh;

// ── Scroll-to-top ──
scrollTopBtn.innerHTML = ICONS.up;
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Build skeleton ──
function buildSkeleton(n = 5) {
  return Array.from({ length: n }, () => `
    <div class="skeleton-card">
      <div class="skeleton-line title"></div>
      <div class="skeleton-line w80"></div>
      <div class="skeleton-line w60"></div>
      <div class="skeleton-line w40" style="margin-top:4px;"></div>
    </div>
  `).join('');
}

// ── Build entry card ──
function buildCard(entry, index) {
  const id = `entry-${index}`;
  return `
    <article class="entry-card" id="${id}" data-index="${index}">
      <div class="card-header" role="button" tabindex="0" aria-expanded="false"
           onclick="toggleCard('${id}')" onkeydown="handleKeyCard(event,'${id}')">
        <div class="card-header-left">
          <div class="card-date">${ICONS.calendar} ${escHtml(entry.date)}</div>
          <div class="card-title">${escHtml(entry.title)}</div>
        </div>
        <div class="expand-icon">${ICONS.chevron}</div>
      </div>
      <div class="card-body" id="${id}-body">
        <div class="body-content">${entry.body_html || '<p>No details available.</p>'}</div>
        <div class="card-actions">
          <button class="btn-tweet" onclick="openTweetModal(${index})" title="Share on X (Twitter)">
            ${ICONS.tweet} Tweet this
          </button>
          ${entry.link && entry.link !== '#' ? `
            <a class="btn-view" href="${escHtml(entry.link)}" target="_blank" rel="noopener noreferrer">
              ${ICONS.external} View on docs
            </a>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Toggle card expand ──
function toggleCard(id) {
  const card = document.getElementById(id);
  const header = card.querySelector('.card-header');
  const isExpanded = card.classList.toggle('expanded');
  header.setAttribute('aria-expanded', isExpanded);
}

function handleKeyCard(e, id) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard(id); }
}

// ── Fetch release notes ──
async function fetchReleaseNotes() {
  if (isLoading) return;
  isLoading = true;

  refreshBtn.disabled = true;
  spinner.classList.remove('hidden');
  refreshBtn.querySelector('.label') && (refreshBtn.querySelector('.label').textContent = 'Refreshing…');
  statsBar.classList.remove('visible');
  feedContainer.innerHTML = buildSkeleton(6);

  try {
    const res = await fetch('/api/release-notes');
    const data = await res.json();

    if (data.status !== 'ok') throw new Error(data.message || 'Unknown error');

    allEntries = data.entries;
    renderEntries(allEntries);

    countPill.textContent = `${allEntries.length} updates`;
    lastUpdated.textContent = `Last refreshed: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    statsBar.classList.add('visible');
  } catch (err) {
    feedContainer.innerHTML = `
      <div class="state-card error">
        <div class="icon">⚠️</div>
        <h2>Failed to load release notes</h2>
        <p>${escHtml(err.message)}</p>
      </div>`;
    statsBar.classList.remove('visible');
  } finally {
    isLoading = false;
    refreshBtn.disabled = false;
    spinner.classList.add('hidden');
    const lbl = refreshBtn.querySelector('.label');
    if (lbl) lbl.textContent = 'Refresh';
  }
}

function renderEntries(entries) {
  if (!entries.length) {
    feedContainer.innerHTML = `
      <div class="state-card">
        <div class="icon">📭</div>
        <h2>No release notes found</h2>
        <p>The feed returned no entries. Try refreshing.</p>
      </div>`;
    return;
  }
  feedContainer.innerHTML = entries.map((e, i) => buildCard(e, i)).join('');
}

// ── Tweet Modal ──
let currentTweetEntry = null;
const MAX_TWEET = 280;

function buildTweetText(entry) {
  const link = (entry.link && entry.link !== '#') ? entry.link : 'https://cloud.google.com/bigquery/docs/release-notes';
  const plain = entry.body_plain || '';
  const title = entry.title;
  const suffix = `\n\n🔗 ${link}\n#BigQuery #GCP #GoogleCloud`;
  const budget = MAX_TWEET - suffix.length - 2;
  let body = title;
  if (plain && plain !== title) {
    const snippet = plain.substring(0, budget - title.length - 2);
    body = `${title}\n\n${snippet}`;
  }
  return (body + suffix).substring(0, MAX_TWEET);
}

function openTweetModal(index) {
  currentTweetEntry = allEntries[index];
  const text = buildTweetText(currentTweetEntry);
  tweetText.value = text;
  updateCharCount();
  modalOverlay.classList.add('open');
  tweetText.focus();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  currentTweetEntry = null;
}

function updateCharCount() {
  const len = tweetText.value.length;
  const remaining = MAX_TWEET - len;
  charCount.textContent = `${len} / ${MAX_TWEET}`;
  charCount.className = remaining < 0 ? 'over' : remaining < 20 ? 'warn' : 'good';
  postTweetBtn.disabled = remaining < 0 || len === 0;
}

tweetText.addEventListener('input', updateCharCount);

postTweetBtn.addEventListener('click', () => {
  const text = encodeURIComponent(tweetText.value);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer,width=580,height=420');
  closeModal();
});

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('cancel-tweet-btn').addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

// ── Refresh button ──
refreshBtn.addEventListener('click', fetchReleaseNotes);

// ── Auto-load on page load ──
fetchReleaseNotes();
