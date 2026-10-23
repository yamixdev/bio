(() => {
  'use strict';

  const REPOSITORIES = Object.freeze(['yamixdev/vk-desktop', 'Flowseal/zapret-discord-youtube', 'hiddify/hiddify-app', 'yamixdev/Etonify']);
  const CACHE_TTL = 30 * 60 * 1000;
  const CACHE_PREFIX = 'site-release-v1:';
  const COOLDOWN_KEY = 'site-release-github-cooldown-v1';
  const memory = new Map();
  const pending = new Map();
  const outcomes = new Map();
  const refreshing = new Map();
  const refreshFocus = new Map();
  let cooldown = null;
  let cooldownTimer = null;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const language = () => window.SiteI18n?.language || document.documentElement.lang || 'en';
  const copy = (ru, en) => language().startsWith('ru') ? ru : en;

  function canonicalRepo(repo) {
    const canonical = REPOSITORIES.find(value => value.toLowerCase() === String(repo).toLowerCase());
    if (!canonical) throw new Error('Unsupported release repository');
    return canonical;
  }

  function normalizeRelease(repo, payload, cached = false) {
    if (!payload || typeof payload !== 'object' || (!cached && (payload.draft !== false || payload.prerelease !== false))) throw new Error('Invalid stable release');
    const tagName = cached ? payload.tagName : payload.tag_name;
    const publishedAt = cached ? payload.publishedAt : payload.published_at;
    const url = new URL(cached ? payload.url : payload.html_url);
    const expectedPath = `/${repo}/releases/tag/`;
    if (typeof tagName !== 'string' || !tagName.trim() || !publishedAt || !Number.isFinite(Date.parse(publishedAt)) || url.origin !== 'https://github.com' || !url.pathname.toLowerCase().startsWith(expectedPath.toLowerCase()) || url.username || url.password || url.hash || url.search || decodeURIComponent(url.pathname.slice(expectedPath.length)) !== tagName) throw new Error('Invalid release fields');
    return Object.freeze({ tagName, name: typeof payload.name === 'string' && payload.name.trim() ? payload.name : tagName, publishedAt, url: url.href, body: typeof payload.body === 'string' ? payload.body : '' });
  }

  function readCache(repo) {
    if (memory.has(repo)) return memory.get(repo);
    try {
      const record = JSON.parse(window.localStorage.getItem(CACHE_PREFIX + repo));
      if (!record || !Number.isFinite(record.fetchedAt) || record.fetchedAt <= 0 || record.fetchedAt > Date.now()) return null;
      const validated = { fetchedAt: record.fetchedAt, release: normalizeRelease(repo, record.release, true) };
      memory.set(repo, validated);
      return validated;
    } catch (_) { return null; }
  }

  function readCooldown() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(COOLDOWN_KEY));
      if (saved && Number.isFinite(saved.retryAt) && ['403', '429'].includes(saved.error) && (!cooldown || saved.retryAt > cooldown.retryAt)) cooldown = saved;
    } catch (_) {}
    return cooldown?.retryAt > Date.now() ? cooldown : null;
  }

  function recordCooldown(response) {
    if (![403, 429].includes(response.status)) return null;
    const header = name => response.headers?.get(name);
    const retryAfter = header('retry-after');
    const seconds = retryAfter && /^\d+(?:\.\d+)?$/.test(retryAfter.trim()) ? Number(retryAfter) : NaN;
    const retryDate = retryAfter ? Date.parse(retryAfter) : NaN;
    const reset = header('x-ratelimit-remaining') === '0' ? Number(header('x-ratelimit-reset')) * 1000 : NaN;
    const attempts = Math.min((Number(cooldown?.attempts) || 0) + 1, 6);
    const deadline = Number.isFinite(seconds) ? Date.now() + seconds * 1000 : Number.isFinite(retryDate) ? retryDate : reset;
    cooldown = { retryAt: Math.max(Date.now() + 1000, Number.isFinite(deadline) && deadline > Date.now() ? deadline : Date.now() + 60000 * 2 ** (attempts - 1), Number.isFinite(reset) ? reset : 0, cooldown?.retryAt || 0), error: String(response.status), attempts };
    try { window.localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldown)); } catch (_) {}
    updateControls();
    return cooldown;
  }

  function failedResult(repo, cached, error, retryAt) {
    return { release: cached?.release || null, fetchedAt: cached?.fetchedAt || null, status: cached ? 'stale' : 'error', error, retryAt, fallbackUrl: `https://github.com/${repo}/releases/latest` };
  }

  async function load(repo, { force = false } = {}) {
    repo = canonicalRepo(repo);
    if (pending.has(repo)) return pending.get(repo);
    const cached = readCache(repo);
    const limited = readCooldown();
    if (limited) {
      const result = failedResult(repo, cached, limited.error, limited.retryAt);
      outcomes.set(repo, result);
      return result;
    }
    const previous = outcomes.get(repo);
    if (!force && previous?.error && Date.now() < previous.retryAt) return previous;
    if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      const result = { ...cached, status: 'cached', error: null, fallbackUrl: `https://github.com/${repo}/releases/latest` };
      outcomes.set(repo, result);
      return result;
    }
    const task = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const fallbackUrl = `https://github.com/${repo}/releases/latest`;
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, credentials: 'omit', signal: controller.signal, cache: 'no-store' });
        if (!response.ok) {
          const limit = recordCooldown(response);
          const failure = new Error(String(response.status));
          failure.releaseError = String(response.status);
          failure.retryAt = limit?.retryAt;
          throw failure;
        }
        const release = normalizeRelease(repo, await response.json());
        if (!readCooldown()) {
          cooldown = null;
          try { window.localStorage.setItem(COOLDOWN_KEY, 'null'); } catch (_) {}
        }
        const record = { release, fetchedAt: Date.now() };
        memory.set(repo, record);
        try { window.localStorage.setItem(CACHE_PREFIX + repo, JSON.stringify(record)); } catch (_) {}
        const result = { ...record, status: 'fetched', error: null, fallbackUrl };
        outcomes.set(repo, result);
        return result;
      } catch (error) {
        const result = failedResult(repo, cached, error.releaseError || 'network', error.retryAt || Date.now() + 60000);
        outcomes.set(repo, result);
        return result;
      } finally { clearTimeout(timeout); }
    })();
    pending.set(repo, task);
    try { return await task; } finally { pending.delete(repo); }
  }

  function renderMarkdown(body) {
    if (!window.marked || !window.DOMPurify) return `<pre>${escapeHtml(body)}</pre>`;
    const html = window.marked.parse(String(body || ''), { gfm: true, breaks: false, async: false });
    const fragment = window.DOMPurify.sanitize(html, {
      RETURN_DOM_FRAGMENT: true,
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'del', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a'],
      ALLOWED_ATTR: ['href', 'title', 'start', 'colspan', 'rowspan'],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
    });
    fragment.querySelectorAll('a').forEach(anchor => {
      const href = anchor.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) { anchor.removeAttribute('href'); return; }
      try {
        const url = new URL(href);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) { anchor.removeAttribute('href'); return; }
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      } catch (_) { anchor.removeAttribute('href'); }
    });
    const container = document.createElement('div');
    container.append(fragment);
    return container.innerHTML;
  }

  function formatDate(value, withTime = false) {
    if (!value) return '';
    return new Intl.DateTimeFormat(language().startsWith('ru') ? 'ru-RU' : 'en-US', { dateStyle: 'medium', ...(withTime ? { timeStyle: 'short' } : {}) }).format(new Date(value));
  }

  function statusText(result) {
    const time = formatDate(result.fetchedAt, true);
    if (result.status === 'fetched') return copy(`Проверено через GitHub: ${time}`, `Checked with GitHub: ${time}`);
    if (result.status === 'cached') return copy(`Из кеша · проверено ${time}`, `Cached · checked ${time}`);
    if (result.status === 'stale') return copy(`Устаревший кеш · проверено ${time}. Свежие данные недоступны.`, `Stale cache · checked ${time}. Current data is unavailable.`);
    return copy('Не удалось получить релиз.', 'Could not load the release.');
  }

  function errorText(error) {
    if (error === '403' || error === '429') return copy('GitHub ограничил запросы. Повторите позже или откройте релизы.', 'GitHub has limited requests. Retry later or open releases.');
    if (error === '404') return copy('Публичный стабильный релиз не найден.', 'No public stable release was found.');
    return copy('Проверьте подключение или откройте релизы на GitHub.', 'Check your connection or open releases on GitHub.');
  }

  function retryText(retryAt) {
    const seconds = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
    return seconds ? copy(`Повторная проверка через ${seconds} с.`, `Check again in ${seconds}s.`) : copy('Можно проверить снова.', 'You can check again.');
  }

  function updateControls() {
    if (cooldownTimer !== null) { clearTimeout(cooldownTimer); cooldownTimer = null; }
    const limited = readCooldown();
    const buttons = document.querySelectorAll('[data-release-retry]');
    buttons.forEach(button => {
      const busy = Boolean(refreshing.get(button.dataset.releaseRetry));
      const label = busy ? copy('Проверяем обновления…', 'Checking for updates…') : limited ? retryText(limited.retryAt) : copy('Проверить обновления', 'Check for updates');
      button.disabled = busy || Boolean(limited);
      button.setAttribute('aria-busy', String(busy));
      button.setAttribute('aria-label', label);
      button.title = label;
    });
    const messages = document.querySelectorAll('[data-release-cooldown]');
    messages.forEach(node => { node.textContent = retryText(limited?.retryAt || Number(node.dataset.releaseCooldown)); });
    if (limited && (buttons.length || messages.length)) {
      cooldownTimer = setTimeout(updateControls, Math.min(1000, limited.retryAt - Date.now()));
      cooldownTimer?.unref?.();
    }
  }

  function renderPanel(panel, result) {
    const activeElement = document.activeElement;
    const focusedHref = panel.contains(activeElement) && activeElement.matches('a[href]') ? activeElement.getAttribute('href') : null;
    const release = result.release;
    panel.classList.add('release-notes');
    panel.dataset.releaseStatus = result.status;
    panel.innerHTML = `${release ? `<header class="release-meta"><span>${escapeHtml(copy('Релиз приложения', 'Application release'))}</span><span class="release-version">${escapeHtml(release.tagName)}</span><time datetime="${escapeHtml(release.publishedAt)}">${escapeHtml(formatDate(release.publishedAt))}</time></header>` : ''}
      <div class="release-state${result.error ? ' release-state-error' : ''}" role="status"><span class="release-status">${escapeHtml(statusText(result))}</span>${result.error ? `<span>${escapeHtml(errorText(result.error))}</span>${['403', '429'].includes(result.error) ? `<span data-release-cooldown="${result.retryAt}">${escapeHtml(retryText(result.retryAt))}</span>` : ''}` : ''}</div>
      ${release ? `<div class="release-notes-body">${release.body.trim() ? renderMarkdown(release.body) : `<p>${escapeHtml(copy('Автор не добавил описание релиза.', 'The author did not provide release notes.'))}</p>`}</div>` : ''}`;
    const replacement = focusedHref && [...panel.querySelectorAll('a[href]')].find(link => link.getAttribute('href') === focusedHref);
    replacement?.focus({ preventScroll: true });
  }

  function applyResult(repo, result) {
    document.querySelectorAll(`[data-release-panel="${repo}"]`).forEach(panel => renderPanel(panel, result));
    document.querySelectorAll(`[data-release-version="${repo}"]`).forEach(node => {
      node.textContent = result.release ? result.release.tagName : copy('Версия недоступна', 'Version unavailable');
      node.dataset.releaseStatus = result.status;
      node.title = statusText(result);
    });
    document.querySelectorAll(`[data-release-date="${repo}"]`).forEach(node => { node.textContent = result.release ? formatDate(result.release.publishedAt) : '—'; });
    document.querySelectorAll(`[data-release-state="${repo}"]`).forEach(node => { node.textContent = statusText(result); node.dataset.releaseStatus = result.status; });
    document.querySelectorAll(`[data-release-link="${repo}"]`).forEach(node => { node.href = result.release?.url || result.fallbackUrl; });
    updateControls();
  }

  async function refresh(repo, options = {}) {
    repo = canonicalRepo(repo);
    const focusedButton = document.activeElement?.matches?.(`[data-release-retry="${repo}"]`) ? document.activeElement : null;
    if (focusedButton) refreshFocus.set(repo, focusedButton);
    refreshing.set(repo, (refreshing.get(repo) || 0) + 1);
    updateControls();
    const previous = outcomes.get(repo);
    document.querySelectorAll(`[data-release-panel="${repo}"]`).forEach(panel => {
      if (!previous) panel.innerHTML = `<div class="release-state" role="status">${escapeHtml(copy('Загрузка релиза с GitHub…', 'Loading release from GitHub…'))}</div>`;
      panel.setAttribute('aria-busy', 'true');
    });
    try {
      const result = await load(repo, options);
      applyResult(repo, result);
      return result;
    } finally {
      const remaining = (refreshing.get(repo) || 1) - 1;
      if (remaining) refreshing.set(repo, remaining); else refreshing.delete(repo);
      document.querySelectorAll(`[data-release-panel="${repo}"]`).forEach(panel => panel.setAttribute('aria-busy', String(remaining > 0)));
      updateControls();
      if (!remaining) {
        const focusTarget = refreshFocus.get(repo);
        refreshFocus.delete(repo);
        if (focusTarget?.isConnected && !focusTarget.disabled && document.activeElement === document.body) focusTarget.focus({ preventScroll: true });
      }
    }
  }

  function refreshAll(options = {}) {
    const repos = REPOSITORIES.filter(repo => document.querySelectorAll(`[data-release-version="${repo}"], [data-release-panel="${repo}"]`).length);
    return Promise.all(repos.map(repo => refresh(repo, options)));
  }

  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-release-retry]');
    if (button && !button.disabled) refresh(button.dataset.releaseRetry, { force: true });
    if (event.target.closest?.('[data-tab="software"]')) refreshAll();
  });
  window.addEventListener('site-language-change', () => {
    for (const [repo, result] of outcomes) applyResult(repo, result);
    updateControls();
  });
  window.addEventListener('storage', event => { if (event.key === COOLDOWN_KEY) updateControls(); });

  window.SiteReleases = Object.freeze({ load, refresh, refreshAll, renderMarkdown, CACHE_TTL, repositories: REPOSITORIES });
  if (typeof location !== 'undefined' && location.hash === '#software') refreshAll();
  window.addEventListener('hashchange', () => {
    if (location.hash === '#software') refreshAll();
  });
  if ('IntersectionObserver' in window) {
    const section = document.querySelectorAll('#software')[0];
    if (section) {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        refreshAll();
      });
      observer.observe(section);
    }
  }
})();
