'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const safeStorage = {
    get(key) {
      try { return window.localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, value); } catch (_) { /* storage может быть недоступен */ }
    }
  };

  // ---------------------------------------------------------------------------
  // Навигация по разделам
  // ---------------------------------------------------------------------------
  const navContainer = document.querySelector('.nav-container');
  const indicator = document.getElementById('nav-indicator');
  const navButtons = [...document.querySelectorAll('.nav-btn[data-tab]')];
  const sections = [...document.querySelectorAll('.tab-content')];
  const validTabs = new Set(navButtons.map((button) => button.dataset.tab));

  function moveIndicator(button) {
    if (!button || !indicator || !navContainer) return;

    requestAnimationFrame(() => {
      const offset = button.offsetLeft - indicator.offsetLeft;
      indicator.style.width = `${button.offsetWidth}px`;
      indicator.style.transform = `translate3d(${offset}px, 0, 0)`;
    });
  }

  function activateTab(tabId, { updateUrl = true, focus = false } = {}) {
    if (!validTabs.has(tabId)) tabId = 'home';

    navButtons.forEach((button) => {
      const active = button.dataset.tab === tabId;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active) {
        moveIndicator(button);
        button.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center'
        });
        if (focus) button.focus({ preventScroll: true });
      }
    });

    sections.forEach((section) => {
      const active = section.id === tabId;
      section.classList.toggle('active', active);
      section.hidden = !active;
    });

    if (updateUrl) {
      const nextUrl = tabId === 'home' ? `${location.pathname}${location.search}` : `#${tabId}`;
      history.replaceState({ tab: tabId }, '', nextUrl);
    }
  }

  navButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
    button.addEventListener('keydown', (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + navButtons.length) % navButtons.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % navButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = navButtons.length - 1;
      activateTab(navButtons[nextIndex].dataset.tab, { focus: true });
    });
  });

  const initialTab = location.hash.slice(1);
  activateTab(validTabs.has(initialTab) ? initialTab : 'home', { updateUrl: false });

  window.addEventListener('hashchange', () => {
    const tabId = location.hash.slice(1) || 'home';
    const valid = validTabs.has(tabId);
    activateTab(valid ? tabId : 'home', { updateUrl: !valid });
  });

  const navResizeObserver = 'ResizeObserver' in window
    ? new ResizeObserver(() => moveIndicator(document.querySelector('.nav-btn.active')))
    : null;
  if (navResizeObserver && navContainer) navResizeObserver.observe(navContainer);
  navContainer?.addEventListener('scroll', () => moveIndicator(document.querySelector('.nav-btn.active')), { passive: true });
  document.fonts?.ready.then(() => moveIndicator(document.querySelector('.nav-btn.active')));

  // ---------------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------------
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastMessage = document.getElementById('toast-msg');
  let toastTimer = 0;

  function showToast(message, icon = 'check_circle', color = '#29d17d') {
    if (!toast || !toastIcon || !toastMessage) return;
    toastMessage.textContent = message;
    toastIcon.textContent = icon;
    toastIcon.style.color = color;
    toast.classList.add('active');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('active'), 2800);
  }

  // ---------------------------------------------------------------------------
  // Модальные окна
  // ---------------------------------------------------------------------------
  const overlay = document.getElementById('modal-overlay');
  const modalWindows = [...document.querySelectorAll('.modal-window')];
  const modalTriggers = [...document.querySelectorAll('[data-modal]')];
  let currentModal = null;
  let previousFocus = null;
  let modalHideTimer = 0;

  modalTriggers.forEach((trigger) => {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    if (!trigger.hasAttribute('aria-controls')) trigger.setAttribute('aria-controls', trigger.dataset.modal);
  });

  function getFocusable(container) {
    return [...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden && element.offsetParent !== null);
  }

  function openModal(id, trigger = null) {
    const modal = document.getElementById(id);
    if (!overlay || !modal) return;

    window.clearTimeout(modalHideTimer);
    previousFocus = document.activeElement;

    modalWindows.forEach((item) => {
      item.classList.remove('show');
      item.style.display = 'none';
      item.style.transform = '';
      item.setAttribute('aria-hidden', 'true');
    });
    modalTriggers.forEach((item) => item.setAttribute('aria-expanded', String(item === trigger)));

    currentModal = modal;
    overlay.removeAttribute('inert');
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';

    requestAnimationFrame(() => {
      modal.classList.add('show');
      modal.focus({ preventScroll: true });
    });
  }

  function closeModal({ immediate = false } = {}) {
    if (!currentModal || !overlay) return;

    const modal = currentModal;
    currentModal = null;
    modal.classList.remove('show');

    const finish = () => {
      modal.style.display = 'none';
      modal.style.transform = '';
      modal.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('inert', '');
      document.body.classList.remove('modal-open');
      modalTriggers.forEach((item) => item.setAttribute('aria-expanded', 'false'));
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
      previousFocus = null;
    };

    if (immediate || reducedMotion) finish();
    else modalHideTimer = window.setTimeout(finish, 300);
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-modal]');
    if (trigger) {
      event.preventDefault();
      openModal(trigger.dataset.modal, trigger);
      return;
    }

    if (event.target.closest('.modal-close') || event.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox?.classList.contains('show')) closeLightbox();
      else if (currentModal) closeModal();
      return;
    }

    if (event.key === 'Tab' && lightbox?.classList.contains('show')) {
      event.preventDefault();
      lightboxClose?.focus({ preventScroll: true });
      return;
    }

    if (event.key === 'Tab' && currentModal) {
      const focusable = getFocusable(currentModal);
      if (!focusable.length) {
        event.preventDefault();
        currentModal.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Свайп вниз для закрытия bottom-sheet на телефонах.
  let dragStartY = 0;
  let dragDistance = 0;
  let draggingModal = false;

  document.addEventListener('touchstart', (event) => {
    if (!currentModal || window.innerWidth > 760) return;
    if (!event.target.closest('.drag-target')) return;
    draggingModal = true;
    dragStartY = event.touches[0].clientY;
    dragDistance = 0;
    currentModal.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', (event) => {
    if (!draggingModal || !currentModal) return;
    dragDistance = Math.max(0, event.touches[0].clientY - dragStartY);
    currentModal.style.transform = `translateY(${dragDistance}px)`;
    if (dragDistance > 4 && event.cancelable) event.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!draggingModal || !currentModal) return;
    draggingModal = false;
    currentModal.style.transition = '';
    if (dragDistance > 110) closeModal();
    else currentModal.style.transform = '';
    dragDistance = 0;
  }, { passive: true });

  // ---------------------------------------------------------------------------
  // Котики
  // ---------------------------------------------------------------------------
  const catTerminal = document.getElementById('cat-terminal');
  const catPreviewButton = document.getElementById('cat-preview-button');
  const catImage = document.getElementById('cat-img');
  const catSkeleton = document.getElementById('cat-skeleton');
  const catWaiting = document.getElementById('cat-waiting');
  const catError = document.getElementById('cat-error');
  const catErrorTitle = document.getElementById('cat-err-title');
  const catErrorDescription = document.getElementById('cat-err-desc');
  const catSource = document.getElementById('cat-source');
  const catActions = document.getElementById('cat-actions');
  const catSearchGroup = document.getElementById('cat-search-group');
  const catSearchInput = document.getElementById('cat-search');
  const catSearchButton = document.getElementById('btn-cat-search');
  const catNextButton = document.getElementById('btn-cat-next');
  const catDownloadButton = document.getElementById('btn-cat-download');
  const catStartButton = document.getElementById('btn-wait-start');
  const catRadios = [...document.querySelectorAll('input[name="cat-api"]')];
  const catQuickTags = [...document.querySelectorAll('[data-cat-tag]')];

  let catController = null;
  let currentCatUrl = '';
  let catLoading = false;
  let catRequestId = 0;

  const localTagMap = new Map([
    ['милый', 'cute'],
    ['милая', 'cute'],
    ['смешной', 'funny'],
    ['смешная', 'funny'],
    ['спящий', 'sleep'],
    ['сонный', 'sleep'],
    ['злой', 'angry'],
    ['котёнок', 'kitten'],
    ['котенок', 'kitten'],
    ['рыжий', 'orange'],
    ['белый', 'white'],
    ['чёрный', 'black'],
    ['черный', 'black']
  ]);

  function setCatStatus(message, type = 'success') {
    if (!catTerminal) return;
    const colors = {
      success: '#55d696',
      warning: '#e5bd5c',
      error: '#ff7777',
      info: '#8aaef8'
    };
    catTerminal.textContent = message;
    catTerminal.style.color = colors[type] || colors.success;
  }

  function setCatLoading(loading) {
    catLoading = loading;
    [catSearchButton, catNextButton, catDownloadButton, catStartButton].forEach((button) => {
      if (button) button.disabled = loading;
    });
  }

  function setActiveCatTag(value) {
    const normalizedValue = value.trim().toLowerCase();
    catQuickTags.forEach((item) => {
      const active = (item.dataset.catTag || '').toLowerCase() === normalizedValue;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  }

  function updateCatMode(mode) {
    const supportsTags = mode === 'auto' || mode === 'cataas';
    if (catSearchInput) {
      catSearchInput.disabled = !supportsTags;
      catSearchInput.placeholder = supportsTags
        ? 'Тег на русском или английском'
        : 'Этот источник не поддерживает теги';
      if (!supportsTags) catSearchInput.value = '';
    }
    catQuickTags.forEach((button) => {
      button.disabled = !supportsTags && Boolean(button.dataset.catTag);
    });
    setActiveCatTag(supportsTags ? catSearchInput?.value || '' : '');
    catSearchGroup?.classList.toggle('is-disabled', !supportsTags);
    safeStorage.set('cat-api-mode', mode);
  }

  const savedCatMode = safeStorage.get('cat-api-mode');
  if (savedCatMode && catRadios.some((radio) => radio.value === savedCatMode)) {
    const savedRadio = catRadios.find((radio) => radio.value === savedCatMode);
    savedRadio.checked = true;
  }
  updateCatMode(document.querySelector('input[name="cat-api"]:checked')?.value || 'auto');

  catRadios.forEach((radio) => {
    radio.addEventListener('change', () => updateCatMode(radio.value));
  });

  async function fetchWithTimeout(url, { timeout = 7000, signal, ...options } = {}) {
    const controller = new AbortController();
    let timedOut = false;
    const forwardAbort = () => controller.abort(signal?.reason);
    if (signal?.aborted) forwardAbort();
    else signal?.addEventListener('abort', forwardAbort, { once: true });

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      if (timedOut && !signal?.aborted) {
        const timeoutError = new Error('Превышено время ожидания ответа');
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener('abort', forwardAbort);
    }
  }

  async function normalizeTag(rawTag, signal) {
    const value = rawTag.trim().toLowerCase();
    if (!value) return '';
    if (localTagMap.has(value)) return localTagMap.get(value);
    if (!/[а-яё]/i.test(value)) return value.replace(/[^a-z0-9_-]/gi, '');

    setCatStatus('Перевожу тег…', 'warning');
    try {
      const response = await fetchWithTimeout(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=ru|en`,
        { timeout: 5000, signal }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const translated = data?.responseData?.translatedText || '';
      return translated.split(/\s+/)[0].replace(/[^a-z0-9_-]/gi, '').toLowerCase();
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      return value.replace(/[^a-z0-9_-]/gi, '');
    }
  }

  function cataasExtractor(data) {
    if (!Array.isArray(data) || !data.length) return '';
    const item = data[Math.floor(Math.random() * data.length)];
    const id = item?._id || item?.id;
    return id ? `https://cataas.com/cat/${id}` : '';
  }

  function getCatSources(mode, tag) {
    if (tag) {
      return [{
        name: 'Cataas',
        url: `https://cataas.com/api/cats?tags=${encodeURIComponent(tag)}&limit=30`,
        extract: cataasExtractor
      }];
    }

    const sources = [
      {
        name: 'TheCatAPI',
        key: 'thecatapi',
        url: 'https://api.thecatapi.com/v1/images/search?limit=1&mime_types=jpg,png,webp',
        extract: (data) => data?.[0]?.url || ''
      },
      {
        name: 'Shibe.online',
        key: 'shibe',
        url: 'https://shibe.online/api/cats?count=1&urls=true&httpsUrls=true',
        extract: (data) => data?.[0] || ''
      },
      {
        name: 'Cataas',
        key: 'cataas',
        url: `https://cataas.com/api/cats?limit=24&skip=${Math.floor(Math.random() * 800)}`,
        extract: cataasExtractor
      }
    ];

    if (mode !== 'auto') return sources.filter((source) => source.key === mode);

    const lastSource = safeStorage.get('last-cat-source');
    const lastIndex = sources.findIndex((source) => source.name === lastSource);
    if (lastIndex >= 0) return [...sources.slice(lastIndex + 1), ...sources.slice(0, lastIndex + 1)];
    return sources;
  }

  function preloadImage(url, signal) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      let timeoutId = 0;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        signal?.removeEventListener('abort', abortHandler);
        image.onload = null;
        image.onerror = null;
      };

      const rejectLoad = (error) => {
        cleanup();
        image.src = '';
        reject(error);
      };

      const abortHandler = () => {
        rejectLoad(new DOMException('Aborted', 'AbortError'));
      };

      image.onload = async () => {
        cleanup();
        try { await image.decode?.(); } catch (_) { /* decode необязателен */ }
        resolve(url);
      };
      image.onerror = () => rejectLoad(new Error('Файл изображения недоступен'));
      signal?.addEventListener('abort', abortHandler, { once: true });
      timeoutId = window.setTimeout(() => rejectLoad(new Error('Изображение загружается слишком долго')), 12000);
      image.decoding = 'async';
      image.src = url;
    });
  }

  async function processCat() {
    const requestId = ++catRequestId;
    if (catLoading) catController?.abort();
    catController = new AbortController();
    const { signal } = catController;
    setCatLoading(true);

    if (catImage) {
      catImage.removeAttribute('src');
    }
    currentCatUrl = '';
    if (catPreviewButton) catPreviewButton.hidden = true;
    if (catSkeleton) catSkeleton.style.display = 'block';
    if (catWaiting) catWaiting.style.display = 'none';
    if (catError) catError.style.display = 'none';
    if (catSource) catSource.hidden = true;
    if (catActions) catActions.hidden = true;

    const mode = document.querySelector('input[name="cat-api"]:checked')?.value || 'auto';
    let tag = '';

    try {
      tag = await normalizeTag(catSearchInput?.value || '', signal);
      if ((mode === 'thecatapi' || mode === 'shibe') && tag) tag = '';

      const sources = getCatSources(mode, tag);
      let selected = null;
      let lastError = null;

      for (const source of sources) {
        try {
          setCatStatus(tag ? `Ищу «${tag}» через ${source.name}…` : `Подключаюсь к ${source.name}…`, 'info');
          const response = await fetchWithTimeout(source.url, { timeout: 7500, signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          const imageUrl = source.extract(data);
          if (!imageUrl) throw new Error(tag ? 'По этому тегу ничего не найдено' : 'API вернул пустой ответ');
          await preloadImage(imageUrl, signal);
          selected = { imageUrl, sourceName: source.name };
          break;
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          lastError = error;
          setCatStatus(`${source.name} не ответил, пробую другой…`, 'warning');
        }
      }

      if (!selected) throw lastError || new Error('Все источники временно недоступны');

      currentCatUrl = selected.imageUrl;
      safeStorage.set('last-cat-source', selected.sourceName);
      if (catImage) {
        catImage.src = selected.imageUrl;
      }
      if (catPreviewButton) catPreviewButton.hidden = false;
      if (catSource) {
        catSource.textContent = selected.sourceName;
        catSource.hidden = false;
      }
      if (catActions) catActions.hidden = false;
      setCatStatus(`Загружено через ${selected.sourceName}.`);
    } catch (error) {
      if (error.name === 'AbortError') return;
      currentCatUrl = '';
      if (catPreviewButton) catPreviewButton.hidden = true;
      if (catErrorTitle) catErrorTitle.textContent = tag ? 'Котик не найден' : 'Источник недоступен';
      if (catErrorDescription) catErrorDescription.textContent = error.message || 'Попробуйте ещё раз.';
      if (catError) catError.style.display = 'block';
      if (catActions) catActions.hidden = false;
      setCatStatus(error.message || 'Не удалось загрузить котика.', 'error');
    } finally {
      if (requestId === catRequestId) {
        if (catSkeleton) catSkeleton.style.display = 'none';
        setCatLoading(false);
      }
    }
  }

  catStartButton?.addEventListener('click', processCat);
  catSearchButton?.addEventListener('click', processCat);
  catNextButton?.addEventListener('click', processCat);
  catSearchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      processCat();
    }
  });

  catQuickTags.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveCatTag(button.dataset.catTag || '');
      if (catSearchInput && !catSearchInput.disabled) catSearchInput.value = button.dataset.catTag || '';
      processCat();
    });
  });

  catSearchInput?.addEventListener('input', () => {
    setActiveCatTag(catSearchInput.value);
  });

  catDownloadButton?.addEventListener('click', async () => {
    if (!currentCatUrl) {
      showToast('Сначала загрузите котика', 'info', '#8aaef8');
      return;
    }

    catDownloadButton.disabled = true;
    const downloadUrl = currentCatUrl;
    try {
      const response = await fetchWithTimeout(downloadUrl, { timeout: 12000 });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `cat-${Date.now()}.${blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg'}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      showToast('Котик скачан');
    } catch (_) {
      const popup = window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      if (popup) showToast('Изображение открыто в новой вкладке', 'open_in_new', '#8aaef8');
      else showToast('Браузер заблокировал открытие изображения', 'error', '#ff7777');
    } finally {
      catDownloadButton.disabled = catLoading;
    }
  });

  // ---------------------------------------------------------------------------
  // Lightbox
  // ---------------------------------------------------------------------------
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  let lightboxPreviousFocus = null;

  function openLightbox(url) {
    if (!lightbox || !lightboxImage || !url) return;
    lightboxPreviousFocus = document.activeElement;
    lightboxImage.src = url;
    lightbox.style.display = 'flex';
    lightbox.removeAttribute('inert');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => lightbox.classList.add('show'));
    lightboxClose?.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      lightbox.style.display = 'none';
      lightbox.setAttribute('inert', '');
      if (lightboxImage) lightboxImage.removeAttribute('src');
      if (!currentModal) document.body.classList.remove('modal-open');
      if (lightboxPreviousFocus instanceof HTMLElement) lightboxPreviousFocus.focus({ preventScroll: true });
      lightboxPreviousFocus = null;
    }, reducedMotion ? 0 : 220);
  }

  catPreviewButton?.addEventListener('click', () => openLightbox(currentCatUrl));
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  // ---------------------------------------------------------------------------
  // Spotify через Lanyard
  // ---------------------------------------------------------------------------
  const DISCORD_ID = '835456105328410625';
  const spotifyWidget = document.getElementById('spotify-widget');
  const spotifyStatus = document.getElementById('sp-status-text');
  const spotifySong = document.getElementById('sp-song');
  const spotifyArtist = document.getElementById('sp-artist');
  const spotifyCover = document.getElementById('sp-cover');
  const spotifyProgress = document.getElementById('sp-progress');
  const spotifyCurrent = document.getElementById('sp-time-current');
  const spotifyEnd = document.getElementById('sp-time-end');
  let spotifyInterval = 0;
  let lanyardSocket = null;
  let heartbeatInterval = 0;
  let reconnectTimer = 0;
  let reconnectDelay = 4000;

  function formatTime(milliseconds) {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function updateSpotifyUI(spotify) {
    window.clearInterval(spotifyInterval);

    if (!spotifyWidget || !spotifyStatus || !spotifySong || !spotifyArtist || !spotifyCover) return;

    if (!spotify) {
      spotifyWidget.classList.remove('playing');
      spotifyWidget.classList.add('idle');
      spotifyWidget.removeAttribute('data-track-url');
      spotifyWidget.removeAttribute('role');
      spotifyWidget.removeAttribute('tabindex');
      spotifyWidget.style.removeProperty('--bg-img');
      spotifyCover.style.backgroundImage = '';
      spotifyStatus.textContent = 'Музыка на паузе';
      spotifySong.textContent = 'Сейчас я не слушаю Spotify';
      spotifyArtist.textContent = 'Статус обновляется автоматически';
      if (spotifyProgress) spotifyProgress.style.width = '0%';
      if (spotifyCurrent) spotifyCurrent.textContent = '0:00';
      if (spotifyEnd) spotifyEnd.textContent = '0:00';
      return;
    }

    const trackUrl = spotify.track_id ? `https://open.spotify.com/track/${spotify.track_id}` : '';
    spotifyWidget.classList.add('playing');
    spotifyWidget.classList.remove('idle');
    if (trackUrl) {
      spotifyWidget.dataset.trackUrl = trackUrl;
      spotifyWidget.setAttribute('role', 'link');
      spotifyWidget.tabIndex = 0;
    } else {
      spotifyWidget.removeAttribute('data-track-url');
      spotifyWidget.removeAttribute('role');
      spotifyWidget.removeAttribute('tabindex');
    }
    spotifyWidget.style.setProperty('--bg-img', `url("${spotify.album_art_url}")`);
    spotifyCover.style.backgroundImage = `url("${spotify.album_art_url}")`;
    spotifyStatus.textContent = 'Сейчас играет';
    spotifySong.textContent = spotify.song || 'Неизвестный трек';
    spotifyArtist.textContent = (spotify.artist || 'Неизвестный исполнитель').replace(/;/g, ', ');

    const start = Number(spotify.timestamps?.start || Date.now());
    const end = Number(spotify.timestamps?.end || start);
    const duration = Math.max(1, end - start);
    if (spotifyEnd) spotifyEnd.textContent = formatTime(duration);

    const updateProgress = () => {
      const elapsed = Math.min(duration, Math.max(0, Date.now() - start));
      if (spotifyProgress) spotifyProgress.style.width = `${(elapsed / duration) * 100}%`;
      if (spotifyCurrent) spotifyCurrent.textContent = formatTime(elapsed);
      if (Date.now() >= end) window.clearInterval(spotifyInterval);
    };

    updateProgress();
    spotifyInterval = window.setInterval(updateProgress, 1000);
  }

  function openSpotifyTrack() {
    const url = spotifyWidget?.dataset.trackUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  spotifyWidget?.addEventListener('click', openSpotifyTrack);
  spotifyWidget?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openSpotifyTrack();
    }
  });

  async function loadInitialLanyardState() {
    try {
      const response = await fetchWithTimeout(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`, { timeout: 5500 });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload?.success && payload.data) {
        updateSpotifyUI(payload.data.listening_to_spotify ? payload.data.spotify : null);
      }
    } catch (_) {
      // Виджет остаётся в спокойном состоянии, если API недоступен.
    }
  }

  function clearLanyardTimers() {
    window.clearInterval(heartbeatInterval);
    window.clearTimeout(reconnectTimer);
    heartbeatInterval = 0;
    reconnectTimer = 0;
  }

  function scheduleReconnect() {
    if (document.hidden || !navigator.onLine) return;
    window.clearTimeout(reconnectTimer);
    reconnectTimer = window.setTimeout(connectLanyard, reconnectDelay);
    reconnectDelay = Math.min(30000, Math.round(reconnectDelay * 1.55));
  }

  function connectLanyard() {
    if (document.hidden || !navigator.onLine) return;
    if (lanyardSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(lanyardSocket.readyState)) return;

    clearLanyardTimers();
    lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');

    lanyardSocket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.op === 1) {
          reconnectDelay = 4000;
          lanyardSocket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
          const interval = Number(payload.d?.heartbeat_interval || 30000);
          heartbeatInterval = window.setInterval(() => {
            if (lanyardSocket?.readyState === WebSocket.OPEN) {
              lanyardSocket.send(JSON.stringify({ op: 3 }));
            }
          }, interval);
          return;
        }

        if (payload.t === 'INIT_STATE' || payload.t === 'PRESENCE_UPDATE') {
          const state = payload.t === 'INIT_STATE' && payload.d?.[DISCORD_ID]
            ? payload.d[DISCORD_ID]
            : payload.d;
          if (state) updateSpotifyUI(state.listening_to_spotify ? state.spotify : null);
        }
      } catch (_) {
        // Некорректный пакет не должен ломать остальную страницу.
      }
    });

    lanyardSocket.addEventListener('close', () => {
      window.clearInterval(heartbeatInterval);
      heartbeatInterval = 0;
      scheduleReconnect();
    });

    lanyardSocket.addEventListener('error', () => {
      lanyardSocket?.close();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      lanyardSocket?.close(1000, 'Page hidden');
      clearLanyardTimers();
    } else {
      loadInitialLanyardState();
      connectLanyard();
    }
  });

  window.addEventListener('online', connectLanyard);
  window.addEventListener('offline', () => {
    lanyardSocket?.close();
    clearLanyardTimers();
  });

  loadInitialLanyardState();
  connectLanyard();
});
