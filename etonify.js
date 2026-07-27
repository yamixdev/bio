(() => {
  'use strict';

  const docs = window.ETONIFY_DOCS;
  if (!docs) return;

  const RELEASE_TAG = '0.2.5';
  const RELEASE_SNAPSHOT_URL = 'assets/etonify-latest-release.json';
  const RELEASES_URL = `https://github.com/yamixdev/Etonify/releases/tag/${RELEASE_TAG}`;

  const root = document.documentElement;
  const body = document.body;
  const contentRoot = document.querySelector('#doc-content');
  const navigationRoot = document.querySelector('#side-navigation');
  const menuButton = document.querySelector('#menu-button');
  const menuButtonLabel = document.querySelector('#menu-button-label');
  const sidebar = document.querySelector('#sidebar');
  const sidebarBackdrop = document.querySelector('#sidebar-backdrop');
  const releaseDialogTrigger = document.querySelector('#release-dialog-trigger');
  const releaseDialog = document.querySelector('#release-dialog');
  const releaseDialogClose = document.querySelector('#release-dialog-close');
  const searchTrigger = document.querySelector('#search-trigger');
  const searchDialog = document.querySelector('#search-dialog');
  const searchInput = document.querySelector('#search-input');
  const searchResults = document.querySelector('#search-results');
  const searchHint = document.querySelector('#search-hint');
  const searchClose = document.querySelector('#search-close');
  const toTop = document.querySelector('#to-top');
  const progressBar = document.querySelector('#scroll-progress-bar');
  const copyToast = document.querySelector('#copy-toast');
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const sectionIcons = Object.freeze({
    start: 'vpn_key',
    features: 'widgets',
    install: 'install_mobile',
    'quick-start': 'rocket_launch',
    subscriptions: 'add_link',
    servers: 'speed',
    'split-routing': 'alt_route',
    'dns-routing': 'dns',
    backup: 'backup',
    updates: 'system_update',
    troubleshooting: 'troubleshoot',
    diagnostics: 'description',
    privacy: 'shield_lock',
    faq: 'help',
    support: 'support_agent',
  });

  let language = root.dataset.lang === 'en' ? 'en' : 'ru';
  let activeSectionId = location.hash.slice(1) || 'start';
  const initialHashTarget = location.hash.slice(1);
  let initialNavigationPending = Boolean(initialHashTarget);
  let scrollSpyFrame = null;
  let toastTimer = null;
  let navigationLockId = null;
  let navigationLockTimer = null;
  let navigationScrollToken = 0;
  let releaseStatus = 'idle';
  let releaseData = null;
  let releaseDialogReturnFocus = null;
  let revealObserver = null;

  const safeStorage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (_) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (_) {
        // Preferences remain active for the current tab when storage is blocked.
      }
    },
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function plainText(html) {
    const element = document.createElement('div');
    element.innerHTML = html.replace(/></g, '> <');
    return element.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  function normalizeSearch(value) {
    return value
      .toLocaleLowerCase(language === 'ru' ? 'ru' : 'en')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function currentCopy() {
    return docs[language];
  }

  function materialIcon(name, extraClass = '') {
    const className = extraClass ? ` ${extraClass}` : '';
    return `<span class="material-symbols-rounded${className}" aria-hidden="true">${escapeHtml(name)}</span>`;
  }

  function renderReleaseInline(value) {
    const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https:\/\/[^\s)"]+\))/g;
    let cursor = 0;
    let output = '';

    for (const match of value.matchAll(tokenPattern)) {
      output += escapeHtml(value.slice(cursor, match.index));
      const token = match[0];
      if (token.startsWith('`')) {
        output += `<code>${escapeHtml(token.slice(1, -1))}</code>`;
      } else if (token.startsWith('**')) {
        output += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
      } else {
        const link = token.match(/^\[([^\]]+)\]\((https:\/\/[^\s)"]+)\)$/);
        if (link) {
          output += `<a href="${escapeHtml(link[2])}" target="_blank" rel="noreferrer">${escapeHtml(link[1])}</a>`;
        } else {
          output += escapeHtml(token);
        }
      }
      cursor = match.index + token.length;
    }

    return output + escapeHtml(value.slice(cursor));
  }

  function renderReleaseMarkdown(markdown) {
    const lines = String(markdown || '').replaceAll('\r', '').split('\n');
    const parts = [];
    let listOpen = false;

    const closeList = () => {
      if (!listOpen) return;
      parts.push('</ul>');
      listOpen = false;
    };

    lines.forEach((line) => {
      const heading = line.match(/^#{1,4}\s+(.+)$/);
      const listItem = line.match(/^[-*]\s+(.+)$/);
      if (heading) {
        closeList();
        parts.push(`<h4>${renderReleaseInline(heading[1])}</h4>`);
      } else if (listItem) {
        if (!listOpen) {
          parts.push('<ul>');
          listOpen = true;
        }
        parts.push(`<li>${renderReleaseInline(listItem[1])}</li>`);
      } else if (line.trim()) {
        closeList();
        parts.push(`<p>${renderReleaseInline(line.trim())}</p>`);
      } else {
        closeList();
      }
    });
    closeList();
    return parts.join('');
  }

  function formatReleaseDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  function renderReleaseNotes() {
    const copy = currentCopy();
    document.querySelectorAll('[data-release-notes]').forEach((container) => {
      if (releaseStatus === 'loaded' && releaseData) {
        const title = releaseData.name || releaseData.tagName;
        const published = formatReleaseDate(releaseData.publishedAt);
        const isSummary = container.hasAttribute('data-release-summary');
        const action = isSummary
          ? `<button class="release-link" type="button" data-release-dialog-open><span>${escapeHtml(copy.ui.releaseShowChanges)}</span>${materialIcon('arrow_forward')}</button>`
          : `<a class="release-link" href="${escapeHtml(releaseData.url)}" target="_blank" rel="noreferrer"><span>${escapeHtml(copy.ui.releaseOpen)}</span>${materialIcon('open_in_new')}</a>`;
        container.innerHTML = `
          <article class="release-card${isSummary ? ' release-card-summary' : ''}">
            <header class="release-card-head">
              <span class="release-card-icon">${materialIcon('new_releases')}</span>
              <div>
                <span class="release-label">${escapeHtml(copy.ui.releaseLatest)}</span>
                <h3>${escapeHtml(title)}</h3>
                ${published ? `<small>${escapeHtml(copy.ui.releasePublished)} ${escapeHtml(published)}</small>` : ''}
              </div>
              ${action}
            </header>
            ${isSummary ? '' : `<div class="release-notes-body">${renderReleaseMarkdown(releaseData.body)}</div>`}
          </article>`;
        container.querySelector('[data-release-dialog-open]')?.addEventListener('click', openReleaseDialog);
        return;
      }

      if (releaseStatus === 'error') {
        container.innerHTML = `
          <div class="release-state release-state-error">
            ${materialIcon('troubleshoot')}
            <div>
              <strong>${escapeHtml(copy.ui.releaseUnavailable)}</strong>
              <span>${escapeHtml(copy.ui.releaseUnavailableHint)}</span>
            </div>
            <button type="button" data-release-retry>${materialIcon('refresh')}<span>${escapeHtml(copy.ui.releaseRetry)}</span></button>
            <a href="${RELEASES_URL}" target="_blank" rel="noreferrer">${escapeHtml(copy.ui.releaseOpen)}</a>
          </div>`;
        container.querySelector('[data-release-retry]')?.addEventListener('click', () => loadReleaseNotes(true));
        return;
      }

      container.innerHTML = `
        <div class="release-state">
          ${materialIcon('refresh', 'release-spinner')}
          <div>
            <strong>${escapeHtml(copy.ui.releaseLoading)}</strong>
            <span>${escapeHtml(copy.ui.releaseSource)}</span>
          </div>
        </div>`;
    });
  }

  async function loadReleaseNotes(force = false) {
    if (force) {
      releaseStatus = 'idle';
      releaseData = null;
    }
    if (releaseStatus === 'loaded') {
      renderReleaseNotes();
      return;
    }
    if (releaseStatus === 'loading') return;

    releaseStatus = 'loading';
    renderReleaseNotes();
    try {
      const response = await fetch(RELEASE_SNAPSHOT_URL, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Release snapshot request failed: ${response.status}`);
      const payload = await response.json();
      if (!payload || payload.tagName !== RELEASE_TAG) throw new Error(`Expected release ${RELEASE_TAG}`);
      releaseData = {
        tagName: payload.tagName,
        name: typeof payload.name === 'string' && payload.name.trim() ? payload.name : payload.tagName,
        body: typeof payload.body === 'string' ? payload.body : '',
        publishedAt: payload.publishedAt,
        url: typeof payload.url === 'string' && payload.url.startsWith(`${RELEASES_URL}/`)
          ? payload.url
          : RELEASES_URL,
      };
      releaseStatus = 'loaded';
    } catch (_) {
      releaseStatus = 'error';
    }
    renderReleaseNotes();
  }

  function renderHero(hero) {
    const nodes = hero.nodes
      .map(
        (node) => `
          <div class="connection-node">
            <i aria-hidden="true"></i>
            <strong>${escapeHtml(node.label)}</strong>
            <small>${escapeHtml(node.detail)}</small>
          </div>`,
      )
      .join('');

    return `
      <section class="hero" aria-labelledby="hero-title">
        <span class="eyebrow">${escapeHtml(hero.eyebrow)}</span>
        <h1 id="hero-title">${escapeHtml(hero.title)}</h1>
        <p class="hero-lead">${escapeHtml(hero.lead)}</p>
        <div class="hero-actions">
          <a class="button-primary" href="#quick-start">${materialIcon('arrow_forward')}<span>${escapeHtml(hero.primary)}</span></a>
          <a class="button-secondary" href="#troubleshooting">${materialIcon('troubleshoot')}<span>${escapeHtml(hero.secondary)}</span></a>
        </div>
        <p class="hero-note">${escapeHtml(hero.note)}</p>
        <div class="connection-map" aria-label="${escapeHtml(hero.routeLabel)}">
          <span>${escapeHtml(hero.routeLabel)}</span>
          <div class="connection-route">${nodes}</div>
        </div>
      </section>`;
  }

  function renderSection(section) {
    return `
      <section class="doc-section" id="${escapeHtml(section.id)}" data-search-section>
        <header class="section-heading">
          <div class="section-heading-meta">
            <span class="section-symbol">${materialIcon(sectionIcons[section.id] || 'description')}</span>
            <span class="section-kicker">${escapeHtml(section.kicker)}</span>
          </div>
          <h2>${escapeHtml(section.title)}</h2>
          <p class="section-lead">${escapeHtml(section.lead)}</p>
        </header>
        <div class="section-body">${section.body}</div>
      </section>`;
  }

  function renderNavigation(copy) {
    const groupOrder = ['start', 'use', 'solve', 'project'];
    navigationRoot.innerHTML = groupOrder
      .map((group) => {
        const items = copy.sections.filter((section) => section.group === group);
        if (!items.length) return '';
        return `
          <div class="nav-group">
            <span class="nav-group-title">${escapeHtml(copy.groups[group])}</span>
            ${items
              .map(
                (section) => `<a href="#${escapeHtml(section.id)}" data-section-link="${escapeHtml(section.id)}">${materialIcon(sectionIcons[section.id] || 'description')}<span>${escapeHtml(section.nav)}</span></a>`,
              )
              .join('')}
          </div>`;
      })
      .join('');

    navigationRoot.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        closeSidebar();
        navigateToSection(link.dataset.sectionLink);
      });
    });
  }

  function enhanceCodeBlocks(copy) {
    contentRoot.querySelectorAll('.command-block').forEach((block) => {
      const toolbar = block.querySelector(':scope > div');
      const code = block.querySelector('code');
      if (!toolbar || !code) return;
      const button = document.createElement('button');
      button.className = 'copy-code';
      button.type = 'button';
      button.innerHTML = `${materialIcon('content_copy')}<span>${escapeHtml(copy.ui.copy)}</span>`;
      button.addEventListener('click', async () => {
        const value = code.textContent || '';
        try {
          await navigator.clipboard.writeText(value);
        } catch (_) {
          const input = document.createElement('textarea');
          input.value = value;
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.append(input);
          input.select();
          document.execCommand('copy');
          input.remove();
        }
        showToast(copy.ui.copied);
      });
      toolbar.append(button);
    });
  }

  function render() {
    const copy = currentCopy();
    const preservedSection = activeSectionId;

    document.title = copy.meta.title;
    descriptionMeta?.setAttribute('content', copy.meta.description);
    ogTitle?.setAttribute('content', copy.meta.title);
    ogDescription?.setAttribute('content', copy.meta.description);
    root.lang = language;
    root.dataset.lang = language;

    contentRoot.innerHTML = `${renderHero(copy.hero)}${copy.sections.map(renderSection).join('')}`;
    renderNavigation(copy);
    enhanceCodeBlocks(copy);
    localizeChrome(copy);
    setupRevealAnimations();
    loadReleaseNotes();
    observeSections();
    setActiveSection(preservedSection, false);
    updateSearch('');
  }

  function localizeChrome(copy) {
    document.querySelector('#brand-kind').textContent = copy.ui.brandKind;
    document.querySelector('#search-trigger-label').textContent = copy.ui.searchTrigger;
    document.querySelector('#search-title').textContent = copy.ui.searchTitle;
    document.querySelector('#sidebar-version').textContent = copy.ui.version;
    document.querySelector('#sidebar-platform').textContent = copy.ui.platform;
    document.querySelector('#release-dialog-title').textContent = copy.ui.releaseDialogTitle;
    releaseDialogTrigger.setAttribute('aria-label', `${copy.ui.releaseShowChanges}: ${copy.ui.version}`);
    releaseDialogClose.setAttribute('aria-label', copy.ui.releaseDialogClose);
    document.querySelector('.skip-link').textContent = language === 'ru' ? 'К содержанию' : 'Skip to content';
    searchInput.placeholder = copy.ui.searchPlaceholder;
    searchInput.setAttribute('aria-label', copy.ui.searchTitle);
    searchClose.setAttribute('aria-label', language === 'ru' ? 'Закрыть' : 'Close');
    toTop.setAttribute('aria-label', copy.ui.toTop);
    sidebar.setAttribute('aria-label', copy.ui.brandKind);
    navigationRoot.setAttribute('aria-label', language === 'ru' ? 'Разделы' : 'Sections');
    updateMenuLabel();

    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
  }

  function setLanguage(nextLanguage, persist = true) {
    if (!docs[nextLanguage] || nextLanguage === language) return;
    language = nextLanguage;
    if (persist) safeStorage.set('etonify-docs-language', language);
    render();

    requestAnimationFrame(() => {
      const target = document.getElementById(activeSectionId);
      if (target && scrollY > 100) target.scrollIntoView({ block: 'start' });
    });
  }

  function setupRevealAnimations() {
    revealObserver?.disconnect();
    const targets = [
      contentRoot.querySelector('.connection-map'),
      ...contentRoot.querySelectorAll('.doc-section'),
    ].filter(Boolean);
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('reveal-ready');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-revealed'));
      return;
    }

    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -8% 0px',
    });

    targets.forEach((target) => revealObserver.observe(target));
  }

  function openSidebar() {
    body.classList.add('sidebar-open');
    menuButton.setAttribute('aria-expanded', 'true');
    updateMenuLabel();
    navigationRoot.querySelector('a.active, a')?.focus();
  }

  function closeSidebar() {
    body.classList.remove('sidebar-open');
    menuButton.setAttribute('aria-expanded', 'false');
    updateMenuLabel();
  }

  function updateMenuLabel() {
    const isOpen = body.classList.contains('sidebar-open');
    const ui = currentCopy().ui;
    menuButtonLabel.textContent = isOpen ? ui.menuClose : ui.menuOpen;
  }

  function setActiveSection(sectionId, updateHistory = true) {
    if (!document.getElementById(sectionId)) sectionId = 'start';
    activeSectionId = sectionId;
    navigationRoot.querySelectorAll('[data-section-link]').forEach((link) => {
      const active = link.dataset.sectionLink === activeSectionId;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (updateHistory && location.hash !== `#${activeSectionId}`) {
      history.replaceState(null, '', `#${activeSectionId}`);
    }
  }

  function navigateToSection(sectionId, behavior = 'smooth') {
    const target = document.getElementById(sectionId);
    if (!target) return;
    clearTimeout(navigationLockTimer);
    const scrollToken = ++navigationScrollToken;
    navigationLockId = sectionId;
    setActiveSection(sectionId);
    const releaseNavigationLock = () => {
      if (scrollToken !== navigationScrollToken) return;
      clearTimeout(navigationLockTimer);
      setActiveSection(sectionId, false);
      navigationLockId = null;
      queueScrollSpy();
    };
    const headerHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 68;
    const maximum = document.documentElement.scrollHeight - innerHeight;
    const destination = Math.max(0, Math.min(maximum, target.getBoundingClientRect().top + scrollY - headerHeight - 24));
    const start = scrollY;
    const distance = destination - start;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (behavior !== 'smooth' || reduceMotion || Math.abs(distance) < 2) {
      scrollTo({ top: destination, behavior: 'instant' });
      requestAnimationFrame(releaseNavigationLock);
      return;
    }

    const duration = Math.abs(distance) > 1800 ? 560 : 380;
    const startedAt = performance.now();
    const animate = (now) => {
      if (scrollToken !== navigationScrollToken) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      scrollTo({ top: start + distance * eased, behavior: 'instant' });
      if (progress < 1) requestAnimationFrame(animate);
      else releaseNavigationLock();
    };
    requestAnimationFrame(animate);
    navigationLockTimer = setTimeout(releaseNavigationLock, duration + 240);
  }

  function observeSections() {
    queueScrollSpy();
  }

  function queueScrollSpy() {
    if (scrollSpyFrame !== null) return;
    scrollSpyFrame = requestAnimationFrame(() => {
      scrollSpyFrame = null;
      updateActiveSectionFromScroll();
    });
  }

  function updateActiveSectionFromScroll() {
    if (initialNavigationPending || navigationLockId) return;
    const sections = [...contentRoot.querySelectorAll('.doc-section')];
    if (!sections.length) return;
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) {
      setActiveSection(sections[sections.length - 1].id);
      return;
    }
    const headerHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 68;
    const readingLine = headerHeight + Math.min(140, innerHeight * 0.18);
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top > readingLine) break;
      current = section;
    }
    setActiveSection(current.id);
  }

  function openReleaseDialog() {
    closeSidebar();
    if (searchDialog.open) searchDialog.close();
    releaseDialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : releaseDialogTrigger;
    if (!releaseDialog.open) releaseDialog.showModal();
    releaseDialog.querySelector('.release-dialog-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => releaseDialogClose.focus());
  }

  function closeReleaseDialog() {
    if (releaseDialog.open) releaseDialog.close();
  }

  function openSearch() {
    closeReleaseDialog();
    if (!searchDialog.open) searchDialog.showModal();
    searchInput.value = '';
    updateSearch('');
    requestAnimationFrame(() => searchInput.focus());
  }

  function closeSearch() {
    if (searchDialog.open) searchDialog.close();
    searchTrigger.focus();
  }

  function updateSearch(rawQuery) {
    const copy = currentCopy();
    const query = normalizeSearch(rawQuery);
    if (query.length < 2) {
      searchHint.textContent = copy.ui.searchHint;
      searchResults.innerHTML = '';
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const matches = copy.sections
      .map((section) => {
        const bodyText = plainText(section.body);
        const source = normalizeSearch(`${section.nav} ${section.title} ${section.lead} ${bodyText}`);
        if (!terms.every((term) => source.includes(term))) return null;
        const position = source.indexOf(terms[0]);
        const roughStart = Math.max(0, position - 55);
        const wordBoundary = roughStart > 0
          ? bodyText.lastIndexOf(' ', roughStart)
          : 0;
        const start = Math.max(0, wordBoundary);
        const excerpt = bodyText.slice(start, start + 150).trim();
        const snippet = `${start > 0 ? '…' : ''}${excerpt}`;
        const score = terms.reduce((total, term) => {
          const titleHit = normalizeSearch(`${section.nav} ${section.title}`).includes(term);
          return total + (titleHit ? 3 : 1);
        }, 0);
        return { section, snippet, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    searchHint.textContent = matches.length ? copy.ui.searchResults(matches.length) : copy.ui.searchEmpty;
    searchResults.innerHTML = matches
      .map(
        ({ section, snippet }) => `
          <button class="search-result" type="button" data-search-target="${escapeHtml(section.id)}">
            <strong>${escapeHtml(section.title)}</strong>
            <small>${escapeHtml(snippet)}${snippet.length >= 150 ? '…' : ''}</small>
          </button>`,
      )
      .join('');

    searchResults.querySelectorAll('[data-search-target]').forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.searchTarget;
        searchDialog.close();
        navigateToSection(targetId);
      });
    });
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    copyToast.textContent = message;
    copyToast.classList.add('visible');
    toastTimer = setTimeout(() => copyToast.classList.remove('visible'), 1600);
  }

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max <= 0 ? 0 : Math.min(1, scrollY / max);
    progressBar.style.width = `${progress * 100}%`;
    toTop.classList.toggle('visible', scrollY > 700);
    queueScrollSpy();
  }

  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });

  menuButton.addEventListener('click', () => {
    if (body.classList.contains('sidebar-open')) closeSidebar();
    else openSidebar();
  });
  sidebarBackdrop.addEventListener('click', closeSidebar);

  releaseDialogTrigger.addEventListener('click', openReleaseDialog);
  releaseDialogClose.addEventListener('click', closeReleaseDialog);
  releaseDialog.addEventListener('click', (event) => {
    if (event.target === releaseDialog) closeReleaseDialog();
  });
  releaseDialog.addEventListener('close', () => {
    const target = releaseDialogReturnFocus;
    releaseDialogReturnFocus = null;
    requestAnimationFrame(() => {
      const focusIsUnclaimed = document.activeElement === body || document.activeElement === releaseDialog;
      if (focusIsUnclaimed && target?.isConnected) target.focus();
    });
  });

  searchTrigger.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  searchInput.addEventListener('input', () => updateSearch(searchInput.value));

  contentRoot.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const sectionId = link.getAttribute('href')?.slice(1);
    if (!sectionId || !document.getElementById(sectionId)) return;
    event.preventDefault();
    navigateToSection(sectionId);
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (event.key === '/' && !isTyping && !searchDialog.open) {
      event.preventDefault();
      openSearch();
    }
    if (event.key === 'Escape') {
      if (body.classList.contains('sidebar-open')) closeSidebar();
    }
  });

  searchDialog.addEventListener('click', (event) => {
    const rect = searchDialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) searchDialog.close();
  });

  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  addEventListener('scroll', updateScrollState, { passive: true });
  addEventListener('resize', () => {
    if (innerWidth > 980) closeSidebar();
    updateScrollState();
  });
  addEventListener('hashchange', () => {
    const next = location.hash.slice(1);
    if (next) setActiveSection(next, false);
  });

  render();
  updateScrollState();

  requestAnimationFrame(() => {
    const hashTarget = document.getElementById(initialHashTarget);
    initialNavigationPending = false;
    if (hashTarget) {
      navigateToSection(initialHashTarget, 'auto');
    }
    queueScrollSpy();
  });
})();
