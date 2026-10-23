(() => {
  'use strict';

  const storageKey = 'site-language-mode';
  const root = document.documentElement;
  const modes = new Set(['auto', 'ru', 'en']);
  const english = Object.freeze({
    'VPN-клиент для Android на базе sing-box: подписки, выбор серверов и раздельная маршрутизация.': 'A sing-box VPN client for Android with subscriptions, server selection, and split tunneling.',
    'Импорт подписок': 'Import subscriptions',
    'Ссылка, QR-код или файл.': 'A link, QR code, or file.',
    'Маршрутизация': 'Routing',
    'Выбор приложений и правила трафика.': 'App selection and traffic rules.',
    'DNS и фильтрация': 'DNS and filtering',
    'Диагностика': 'Diagnostics',
    'Логи и состояние подключения.': 'Logs and connection status.',
    'DNS-пресеты и блокировка рекламы.': 'DNS presets and ad blocking.',
    'Для подключения нужна ваша подписка или конфигурация.': 'Bring your own subscription or configuration to connect.',
    'Приложение не предоставляет VPN-серверы.': 'The app does not provide VPN servers.',
    'Проверить обновления': 'Check for updates',
    'Сайт разработчика yamixdev: проекты, приложения, ссылки и котики.': 'yamixdev: projects, apps, links, and cats.',
    'Основная навигация': 'Main navigation',
    'Разделы сайта': 'Site sections',
    'Главная': 'Home',
    'Проекты': 'Projects',
    'Софт': 'Apps',
    'Соцсети': 'Socials',
    'Котики': 'Cats',
    'Аватар': 'Avatar',
    'На связи': 'Online',
    'Статус: на связи': 'Status: online',
    'Илья': 'Ilya',
    'Разрабатываю приложения, интерфейсы и инструменты.': 'I build apps, interfaces, and tools.',
    'Люблю чистый дизайн и понятную логику.': 'I like clean design and straightforward logic.',
    'Основные технологии': 'Main technologies',
    'Музыка на паузе': 'Music is paused',
    'Сейчас я не слушаю Spotify': 'Not listening to Spotify right now',
    'Статус обновляется автоматически': 'Status updates automatically',
    'В планах: собственный стриминг-плеер': 'Coming someday: my own streaming player',
    'Сейчас играет': 'Now playing',
    'Неизвестный трек': 'Unknown track',
    'Неизвестный исполнитель': 'Unknown artist',
    'Открыть «{song}» — {artist} в Spotify': 'Open “{song}” by {artist} on Spotify',
    'GitHub и веб': 'GitHub & web',
    '4 проекта': '4 projects',
    'Личный хаб с проектами, приложениями, контактами и небольшими интерактивными разделами.': 'My personal hub for projects, apps, contacts, and a few interactive extras.',
    'Android-first VPN-клиент с открытым исходным кодом, понятным управлением подписками и диагностикой.': 'An open-source, Android-first VPN client with straightforward subscription management and diagnostics.',
    'Сетевая основа Etonify: модифицированный sing-box и изменения, подготовленные специально для клиента.': 'The network engine behind Etonify: a modified sing-box with changes made specifically for the client.',
    'Сотрудничество': 'Let’s work together',
    'Обсудить проект': 'Discuss a project',
    'Сайт, бот, приложение или небольшой инструмент.': 'A website, bot, app, or small tool.',
    'Полезные приложения': 'Useful apps',
    '4 карточки': '4 apps',
    'Готовый набор для Discord и YouTube.': 'A ready-to-use toolkit for Discord and YouTube.',
    'Универсальный клиент для прокси-профилей.': 'A versatile client for proxy profiles.',
    'Все платформы': 'All platforms',
    'Открытый Android VPN-клиент на базе sing-box.': 'An open-source Android VPN client powered by sing-box.',
    'Контакты': 'Get in touch',
    'Telegram-канал': 'Telegram channel',
    'Новости проектов и разработка': 'Project news and development',
    'Исходный код и релизы': 'Source code and releases',
    'Написать мне': 'Message me',
    'Личные сообщения': 'Direct messages',
    'Небольшой перерыв': 'A little break',
    'Источник': 'Source',
    'Настройки источников котиков': 'Cat image sources',
    'Быстрые теги': 'Quick tags',
    'Случайный': 'Random',
    'Милый': 'Cute',
    'Котёнок': 'Kitten',
    'Рыжий': 'Orange',
    'Спящий': 'Sleeping',
    'Смешной': 'Funny',
    'Злой': 'Angry',
    'Тег для поиска котика': 'Cat search tag',
    'Этот источник не поддерживает теги': 'This source does not support tags',
    'Найти котика': 'Find a cat',
    'Найти случайного котика?': 'Find a random cat?',
    'Источник выберется автоматически.': 'A source will be selected automatically.',
    'Открыть котика в полном размере': 'View full-size cat photo',
    'Случайный котик': 'A random cat',
    'Не получилось загрузить': 'Unable to load the image',
    'Попробуйте ещё раз или смените источник.': 'Try again or choose a different source.',
    'Готов к поиску.': 'Ready to search.',
    'Следующий': 'Next',
    'Скачать': 'Download',
    'Просмотр изображения': 'Image viewer',
    'Закрыть': 'Close',
    'Котик в полном размере': 'Full-size cat photo',
    'Источник изображений': 'Image source',
    'Для случайных фотографий доступны Cataas и Nekos.life. Для поиска по тегам выберите Авто или Cataas.': 'Cataas and Nekos.life provide random photos. To search by tags, choose Auto or Cataas.',
    'Случайные фотографии котиков': 'Random cat photos',
    'Архив': 'Archived',
    'Архивный клиент VK для Windows с VK Next и Discord Rich Presence. Разработка прекращена, обновлений больше не будет.': 'An archived VK client for Windows with VK Next and Discord Rich Presence. Development has ended; no further updates are planned.',
    'Больше не поддерживается.': 'No longer maintained.',
    'Разработка прекращена': 'Development has ended',
    'Проект больше не поддерживается. Новых версий и исправлений не будет.': 'This project is no longer maintained. There will be no new versions or fixes.',
    'VK Desktop больше не поддерживается. У меня больше нет ни желания, ни времени продолжать разработку проекта.': 'VK Desktop is no longer maintained. I no longer have the desire or the time to continue developing this project.',
    'Комментарий разработчика': 'A note from the developer',
    'Последний архивный релиз': 'Last archived release',
    'Проверяю…': 'Checking…',
    'Версия и изменения проверяются через GitHub.': 'Version and release notes are checked on GitHub.',
    'Архивы и инструкции доступны на официальной странице релиза.': 'Downloads and instructions are available on the official release page.',
    'Выберите подходящий файл на официальной странице релиза.': 'Choose the appropriate download on the official release page.',
    'Теги на русском или английском; несколько — через запятую': 'Tags in Russian or English; separate tags with commas',
    'Cataas поддерживает поиск по тегам. Выберите подсказку или разделите теги запятыми.': 'Cataas searches by tags. Choose a suggestion or separate tags with commas.',
    'Nekos.life показывает только случайные фотографии. Для поиска выберите Авто или Cataas.': 'Nekos.life provides random photos only. To search, choose Auto or Cataas.',
    'Проверяю теги Cataas…': 'Checking Cataas tags…',
    'Не удалось загрузить список тегов Cataas. Попробуйте ещё раз.': 'Unable to load Cataas tags. Try again.',
    'Не удалось перевести тег «{tag}». Попробуйте английский тег из подсказок.': 'Unable to translate “{tag}”. Try an English tag from the suggestions.',
    'Тег «{tag}» не найден в Cataas. Выберите тег из подсказок.': '“{tag}” was not found in Cataas. Choose a suggested tag.',
    'Введите тег из подсказок или очистите поле для случайного фото.': 'Choose a suggested tag, or clear the field for a random photo.',
    'Источник изменён. Нажмите «Найти котика», чтобы загрузить фото.': 'Source changed. Choose “Find a cat” to load a photo.',
    'Автоматически': 'Automatic',
    'Балансировка и резервные источники': 'Source rotation and fallbacks',
    'Поиск по тегам и случайные котики': 'Tag searches and random cats',
    'Проверка версии и целостности.': 'Version and integrity checks.',
    'Трек и статус в профиле.': 'Your track and status in your profile.',
    'Трей': 'System tray',
    'Музыка, сообщения и уведомления.': 'Music, messages, and notifications.',
    'Загружайте только из официального репозитория.': 'Download only from the official repository.',
    'Windows SmartScreen может показать предупреждение из-за отсутствия коммерческого сертификата.': 'Windows SmartScreen may show a warning because the app does not have a commercial signing certificate.',
    'Готовая сборка Flowseal для восстановления доступа к Discord и YouTube с наборами конфигураций и удобным запуском.': 'A ready-to-use Flowseal toolkit for restoring access to Discord and YouTube, with configuration presets and an easy launcher.',
    'Открыть релиз': 'Open release',
    'Кроссплатформенный клиент для импортируемых прокси-профилей и конфигураций.': 'A cross-platform client for imported proxy profiles and configurations.',
    'Поддерживаемые платформы': 'Supported platforms',
    'Сборки отличаются по платформе и архитектуре.': 'Builds vary by platform and architecture.',
    'Превышено время ожидания ответа': 'The request timed out',
    'Перевожу тег…': 'Translating the tag…',
    'Файл изображения недоступен': 'The image is unavailable',
    'Изображение загружается слишком долго': 'The image is taking too long to load',
    'Ищу «{tag}» через {source}…': 'Searching for “{tag}” on {source}…',
    'Подключаюсь к {source}…': 'Connecting to {source}…',
    'По этому тегу ничего не найдено': 'No cats found with this tag',
    'API вернул пустой ответ': 'The source returned no images',
    '{source} не ответил, пробую другой…': '{source} did not respond. Trying another source…',
    'Все источники временно недоступны': 'All sources are temporarily unavailable',
    'Загружено через {source}.': 'Loaded from {source}.',
    'Котик не найден': 'No cat found',
    'Источник недоступен': 'Source unavailable',
    'Попробуйте ещё раз.': 'Try again.',
    'Не удалось загрузить котика.': 'Unable to load a cat photo.',
    'Сначала загрузите котика': 'Load a cat photo first',
    'Котик скачан': 'Cat photo downloaded',
    'Изображение открыто в новой вкладке': 'Image opened in a new tab',
    'Браузер заблокировал открытие изображения': 'Your browser blocked the image from opening'
  });
  const staticBindings = [];
  const liveBindings = new Map();
  const languagePickers = [];
  let ready = false;

  function read(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function normalizeMode(value) {
    return modes.has(value) ? value : 'auto';
  }

  let mode = normalizeMode(read(storageKey) ?? read('etonify-docs-language'));

  function detectLanguage() {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
    for (const value of languages) {
      const language = String(value).toLowerCase().split('-')[0];
      if (language === 'ru' || language === 'en') return language;
    }
    return 'en';
  }

  let language = mode === 'auto' ? detectLanguage() : mode;

  function t(message, params = {}) {
    const template = language === 'en' && Object.hasOwn(english, message) ? english[message] : message;
    return String(template).replace(/\{(\w+)\}/g, (token, key) => Object.hasOwn(params, key) ? String(params[key]) : token);
  }

  function renderBinding(element, binding) {
    const value = t(binding.message, binding.params);
    if (binding.attribute) element.setAttribute(binding.attribute, value);
    else element.textContent = value;
  }

  function bind(element, message, params = {}, attribute = '') {
    if (!element) return;
    if (!liveBindings.has(element)) liveBindings.set(element, new Map());
    const binding = { message, params, attribute };
    liveBindings.get(element).set(attribute, binding);
    renderBinding(element, binding);
  }

  function apply() {
    root.lang = language;
    root.dataset.lang = language;
    root.dataset.languageMode = mode;
    for (const binding of staticBindings) {
      if (!binding.node.isConnected) continue;
      const value = `${binding.before}${t(binding.message)}${binding.after}`;
      if (binding.attribute) binding.node.setAttribute(binding.attribute, value);
      else binding.node.nodeValue = value;
    }
    for (const [element, bindings] of liveBindings) {
      for (const binding of bindings.values()) renderBinding(element, binding);
    }
    if (!ready) return;
    languagePickers.forEach(picker => picker.update());
  }

  function prepareLanguagePicker(picker, index) {
    const trigger = picker.querySelector('[data-language-trigger]');
    const value = picker.querySelector('[data-language-value]');
    const menu = document.createElement('div');
    menu.id = `language-menu-${index}`;
    menu.className = 'language-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-hidden', 'true');
    menu.inert = true;
    trigger.setAttribute('aria-controls', menu.id);
    const choices = ['auto', 'ru', 'en'].map(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'language-option';
      button.dataset.languageOption = choice;
      button.setAttribute('role', 'menuitemradio');
      button.tabIndex = -1;
      if (choice !== 'auto') button.lang = choice;
      menu.append(button);
      button.addEventListener('click', () => {
        setMode(choice);
        close(true);
      });
      return button;
    });
    picker.append(menu);

    function close(restoreFocus = false) {
      trigger.setAttribute('aria-expanded', 'false');
      picker.dataset.open = 'false';
      if (restoreFocus) trigger.focus({ preventScroll: true });
      menu.inert = true;
      menu.setAttribute('aria-hidden', 'true');
      choices.forEach(button => { button.tabIndex = -1; });
    }

    function focusChoice(position) {
      const next = (position + choices.length) % choices.length;
      choices.forEach((button, i) => { button.tabIndex = i === next ? 0 : -1; });
      choices[next].focus({ preventScroll: true });
    }

    function open(position = choices.findIndex(button => button.dataset.languageOption === mode)) {
      languagePickers.forEach(other => other.close());
      menu.inert = false;
      menu.setAttribute('aria-hidden', 'false');
      picker.dataset.open = 'true';
      trigger.setAttribute('aria-expanded', 'true');
      focusChoice(position);
    }

    trigger.addEventListener('click', () => {
      if (trigger.getAttribute('aria-expanded') === 'true') close();
      else open();
    });
    trigger.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      open(event.key === 'ArrowUp' ? choices.length - 1 : 0);
    });
    menu.addEventListener('keydown', event => {
      const current = choices.indexOf(document.activeElement);
      const movement = { ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: choices.length - 1 };
      if (Object.hasOwn(movement, event.key)) {
        event.preventDefault();
        event.stopPropagation();
        focusChoice(movement[event.key]);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      } else if (event.key === 'Tab') {
        close(true);
      } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
        const match = choices.findIndex(button => button.textContent.toLowerCase().startsWith(event.key.toLowerCase()));
        if (match !== -1) {
          event.preventDefault();
          focusChoice(match);
        }
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!picker.contains(event.target)) close();
    });
    picker.addEventListener('focusout', event => {
      if (!picker.contains(event.relatedTarget)) close();
    });

    function update() {
      const ru = language === 'ru';
      const label = ru ? 'Язык сайта' : 'Site language';
      value.textContent = mode === 'auto' ? (ru ? 'Авто' : 'Auto') : mode.toUpperCase();
      trigger.setAttribute('aria-label', `${label}: ${value.textContent}`);
      trigger.title = label;
      menu.setAttribute('aria-label', label);
      choices.forEach(button => {
        const choice = button.dataset.languageOption;
        button.textContent = choice === 'auto' ? (ru ? 'Автоматически' : 'Automatic') : choice === 'ru' ? 'Русский' : 'English';
        button.setAttribute('aria-checked', String(choice === mode));
        button.title = choice === 'auto' ? (ru ? 'По языку браузера' : 'Use browser language') : '';
      });
    }
    return { close, update };
  }

  function setMode(value, persist = true) {
    mode = normalizeMode(value);
    language = mode === 'auto' ? detectLanguage() : mode;
    if (persist) {
      try { localStorage.setItem(storageKey, mode); } catch (_) {}
    }
    apply();
    window.dispatchEvent(new CustomEvent('site-language-change', { detail: { language, mode } }));
  }

  window.SiteI18n = Object.freeze({
    get language() { return language; },
    get mode() { return mode; },
    t, bind, setMode
  });
  apply();

  window.addEventListener('languagechange', () => {
    if (mode === 'auto') setMode('auto', false);
  });
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) setMode(event.newValue, false);
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.i18n === 'bio') {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('script, style, svg, .material-symbols-rounded, [data-i18n-skip]')) continue;
        const message = node.nodeValue.trim();
        if (!Object.hasOwn(english, message)) continue;
        const start = node.nodeValue.indexOf(message);
        staticBindings.push({ node, message, before: node.nodeValue.slice(0, start), after: node.nodeValue.slice(start + message.length) });
      }
      document.querySelectorAll('[aria-label], [title], [placeholder], [alt], meta[name="description"]').forEach((node) => {
        for (const attribute of ['aria-label', 'title', 'placeholder', 'alt', 'content']) {
          const message = node.getAttribute(attribute);
          if (message && Object.hasOwn(english, message)) staticBindings.push({ node, message, attribute, before: '', after: '' });
        }
      });
    }
    ready = true;
    document.querySelectorAll('[data-language-picker]').forEach((picker, index) => {
      languagePickers.push(prepareLanguagePicker(picker, index));
    });
    apply();
  });
})();
