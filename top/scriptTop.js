const TOKEN_KEY = 'gallery_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(data?.error ? `${data.message}: ${data.error}` : (data?.message || 'Ошибка запроса'));
  }

  return data;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderTop(authors) {
  const container = document.getElementById('topList');
  if (!container) return;

  if (!authors.length) {
    container.innerHTML = '<p>Пока нет данных для топа.</p>';
    return;
  }

  container.innerHTML = authors.map((author, index) => {
    const avatar = author.avatar || '../img/user.png';

    return `
      <div class="top-card">
        <div class="top-rank">${index + 1}</div>
        <img class="top-avatar" src="${escapeHtml(avatar)}" alt="avatar">
        <div class="top-info">
          <div class="top-name">@${escapeHtml(author.username)}</div>
          <div class="top-role">${escapeHtml(author.role || '')}</div>
        </div>
        <div class="top-likes">${author.totalLikes} ❤</div>
      </div>
    `;
  }).join('');
}

async function loadTop() {
  const container = document.getElementById('topList');
  if (container) {
    container.innerHTML = '<p>Загрузка...</p>';
  }

  try {
    const authors = await api('/works/top/authors');
    renderTop(authors);
  } catch (error) {
    if (container) {
      container.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', loadTop);