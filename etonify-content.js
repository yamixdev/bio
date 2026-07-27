window.ETONIFY_DOCS = {
  ru: {
    meta: {
      title: 'Etonify — документация',
      description: 'Установка, подписки, серверы, маршрутизация и решение проблем Etonify.',
    },
    ui: {
      brandKind: 'Документация',
      menuOpen: 'Открыть навигацию',
      menuClose: 'Закрыть навигацию',
      searchTrigger: 'Найти ответ',
      searchTitle: 'Поиск по документации',
      searchPlaceholder: 'Что не работает?',
      searchHint: 'Введите хотя бы два символа',
      searchEmpty: 'Ничего не найдено. Попробуйте описать проблему короче.',
      searchResults: (count) => `Найдено: ${count}`,
      themeButton: 'Настроить тему',
      themeSystem: 'Как в системе',
      themeLight: 'Светлая',
      themeDark: 'Тёмная',
      version: 'Версия 0.2.5',
      platform: 'Android 8.0+',
      copy: 'Копировать',
      copied: 'Скопировано',
      toTop: 'Наверх',
      openSection: 'Открыть раздел',
      releaseLatest: 'Последний релиз',
      releaseLoading: 'Загружаем список изменений',
      releaseSource: 'Данные из GitHub Releases',
      releasePublished: 'Опубликовано',
      releaseOpen: 'Открыть релиз',
      releaseUnavailable: 'Не удалось получить изменения с GitHub',
      releaseUnavailableHint: 'Проверьте соединение или откройте страницу релизов напрямую.',
      releaseRetry: 'Повторить',
      releaseShowChanges: 'Показать изменения',
      releaseDialogTitle: 'Что изменилось',
      releaseDialogClose: 'Закрыть список изменений',
    },
    groups: {
      start: 'Начало',
      use: 'Использование',
      solve: 'Решение проблем',
      project: 'О проекте',
    },
    hero: {
      eyebrow: 'Документация · 0.2.5',
      title: 'Настройка без догадок.',
      lead: 'Здесь собраны установка, подписки, выбор серверов, раздельная маршрутизация и понятные действия, когда VPN подключён, но интернет не работает.',
      primary: 'Начать настройку',
      secondary: 'Решить проблему',
      note: 'Etonify — клиент. Он не продаёт и не выдаёт VPN-серверы.',
      routeLabel: 'Как проходит подключение',
      nodes: [
        { label: 'Подписка', detail: 'ваша конфигурация' },
        { label: 'Сервер', detail: 'выбор и URLTest' },
        { label: 'VPN', detail: 'Android TUN' },
        { label: 'Интернет', detail: 'трафик приложения' },
      ],
    },
    sections: [
      {
        id: 'start',
        group: 'start',
        nav: 'Что такое Etonify',
        kicker: 'Перед началом',
        title: 'Клиент для ваших подписок',
        lead: 'Etonify создаёт VPN-туннель на Android и направляет трафик через серверы из добавленной вами подписки или конфигурации.',
        body: `
          <div class="doc-grid three">
            <article class="info-card">
              <span class="card-mark">01</span>
              <h3>Только Android</h3>
              <p>Основная платформа — Android 8.0 и новее. Остальные платформенные папки в исходниках пока не являются релизными целями.</p>
            </article>
            <article class="info-card">
              <span class="card-mark">02</span>
              <h3>Нужна подписка</h3>
              <p>Приложение не предоставляет серверы. Используйте подписку или конфигурацию, которой вы владеете либо имеете право пользоваться.</p>
            </article>
            <article class="info-card">
              <span class="card-mark">03</span>
              <h3>Открытый код</h3>
              <p>Клиент распространяется по Apache-2.0. Исходники, история изменений и сборки находятся на GitHub.</p>
            </article>
          </div>
          <div class="callout neutral">
            <strong>Проект развивается.</strong>
            <p>Перед обновлением сохраняйте рабочую подписку и настройки. Если заметили регрессию, экспортируйте диагностику до переустановки приложения.</p>
          </div>
        `,
      },
      {
        id: 'features',
        group: 'start',
        nav: 'Возможности',
        kicker: 'Что умеет клиент',
        title: 'VPN, подписки и диагностика в одном клиенте',
        lead: 'Etonify ориентирован на Android и объединяет обычный VPN TUN, локальный прокси, управление подписками, маршрутизацию и инструменты для поиска проблем.',
        body: `
          <div class="feature-grid">
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">vpn_key</span></span><div><h3>Системный VPN TUN</h3><p>Направляет трафик Android-приложений через модифицированное ядро sing-box и выбранный сервер.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">devices</span></span><div><h3>Локальный HTTP/SOCKS</h3><p>Отдельный mixed proxy inbound для программ и устройств, которые подключаются к прокси вручную.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">add_link</span></span><div><h3>Импорт подписок</h3><p>URL, QR-код, файл, буфер обмена, deep links, sing-box/Xray и несколько форматов Happ.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">speed</span></span><div><h3>Список прокси</h3><p>Флаги стран, задержка, сортировка, исходный порядок, URLTest и выбор сервера до запуска VPN.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">alt_route</span></span><div><h3>Маршрутизация и DNS</h3><p>Раздельная маршрутизация приложений, DNS-пресеты, Умная маршрутизация и локальный AdGuard DNS Filter.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">description</span></span><div><h3>Контроль состояния</h3><p>Скорость и статистика сессии, активный профиль, OTA-обновления, runtime-логи и экспорт диагностики.</p></div></article>
          </div>
          <div class="callout neutral"><strong>Проект находится в ранней публичной разработке.</strong><p>Production-цель сейчас только Android. Эта документация описывает патч 0.2.5 и актуальное поведение клиента, подготовленное к его выпуску.</p></div>
        `,
      },
      {
        id: 'install',
        group: 'start',
        nav: 'Установка',
        kicker: 'Шаг 1',
        title: 'Установите APK под архитектуру устройства',
        lead: 'Безопаснее всего брать APK из раздела Releases основного репозитория Etonify.',
        body: `
          <ol class="steps">
            <li>
              <span>1</span>
              <div><h3>Откройте последний релиз</h3><p>Перейдите в <a href="https://github.com/yamixdev/Etonify/releases/latest" target="_blank" rel="noreferrer">GitHub Releases</a>. Не скачивайте APK из случайных каналов и перезаливов.</p></div>
            </li>
            <li>
              <span>2</span>
              <div><h3>Выберите файл</h3><p>Если не знаете архитектуру телефона, используйте universal APK. Для большинства современных устройств подходит arm64-v8a.</p></div>
            </li>
            <li>
              <span>3</span>
              <div><h3>Разрешите установку</h3><p>Android может попросить временно разрешить установку из браузера или файлового менеджера. После установки разрешение можно отключить.</p></div>
            </li>
            <li>
              <span>4</span>
              <div><h3>Подтвердите VPN</h3><p>При первом подключении Android покажет системный запрос на создание VPN. Это обязательное разрешение для TUN-режима.</p></div>
            </li>
          </ol>
          <div class="callout warning">
            <strong>Не устанавливается поверх старой сборки?</strong>
            <p>Вероятна другая подпись APK или меньший номер сборки. Сначала экспортируйте данные, затем удалите старую версию и установите новую.</p>
          </div>
          <div class="command-block">
            <div><span>Установка через ADB</span></div>
            <pre><code>adb install -r app-arm64-v8a-release.apk</code></pre>
          </div>
        `,
      },
      {
        id: 'quick-start',
        group: 'start',
        nav: 'Первое подключение',
        kicker: 'Шаг 2',
        title: 'Подписка → сервер → подключение',
        lead: 'Для первого запуска достаточно добавить подписку, выбрать профиль и сервер, затем нажать центральную кнопку.',
        body: `
          <div class="flow-list">
            <article><span class="flow-icon"><span class="material-symbols-rounded" aria-hidden="true">add_link</span></span><div><h3>Добавьте подписку</h3><p>Нажмите «+» на главном экране. Вставьте ссылку, прочитайте QR-код, выберите файл или используйте ручной ввод.</p></div></article>
            <article><span class="flow-icon"><span class="material-symbols-rounded" aria-hidden="true">swap_vert</span></span><div><h3>Выберите сервер</h3><p>Откройте нижнюю панель прокси. Можно выбрать конкретный сервер, «Самый быстрый» или «Умную маршрутизацию».</p></div></article>
            <article><span class="flow-icon"><span class="material-symbols-rounded" aria-hidden="true">power_settings_new</span></span><div><h3>Запустите VPN</h3><p>Нажмите большую кнопку подключения и подтвердите системный VPN-запрос, если Android показывает его впервые.</p></div></article>
          </div>
          <div class="callout success">
            <strong>Можно выбрать сервер до запуска VPN.</strong>
            <p>Etonify сохраняет выбор в подписке и использует его при следующем подключении.</p>
          </div>
          <div class="callout neutral"><strong>VPN TUN и локальный прокси — разные режимы.</strong><p>В интерфейсе 0.2.5 выбирается один основной режим. Локальный HTTP/SOCKS inbound ничего не перенаправляет сам: адрес и порт нужно указать вручную в приложении или на другом устройстве. Для него всегда используются логин <code>etonify</code> и созданный клиентом пароль, даже при подключении только через <code>127.0.0.1</code>.</p></div>
        `,
      },
      {
        id: 'subscriptions',
        group: 'use',
        nav: 'Подписки',
        kicker: 'Профили',
        title: 'Добавление и обновление подписок',
        lead: 'Etonify понимает обычные ссылки, одиночные ключи, sing-box/Xray-конфигурации, локальные файлы и несколько форматов Happ.',
        body: `
          <div class="option-grid">
            <article><h3>Буфер обмена</h3><p>Скопируйте ссылку провайдера и выберите импорт из буфера. Клиент распознает поддерживаемый формат автоматически.</p></article>
            <article><h3>QR-код</h3><p>Разрешение камеры используется только во время сканирования. Проверьте адрес перед подтверждением.</p></article>
            <article><h3>Файл</h3><p>Подходит для локального sing-box/Xray JSON и экспортов, которые не нужно загружать по сети.</p></article>
            <article><h3>Happ</h3><p>Поддерживаются ссылки <code>happ://add</code> и семейство <code>crypt*</code>. HWID отправляется только после явного согласия.</p></article>
          </div>
          <h3 class="subheading">Deep links и Happ</h3>
          <div class="format-strip" aria-label="Поддерживаемые схемы ссылок">
            <code>etonify://import</code><code>happ://add</code><code>happ://crypt*</code><code>sing-box://import-remote-profile</code>
          </div>
          <p class="compact-note">Happ decryptor понимает форматы <code>crypt</code>, <code>crypt2</code>, <code>crypt3</code>, <code>crypt4</code> и <code>crypt5</code>. Если провайдер требует HWID, клиент сначала показывает отдельное подтверждение.</p>
          <h3 class="subheading">Если подписка не добавляется</h3>
          <ul class="check-list">
            <li>Откройте ссылку в браузере и проверьте, что сервер не отвечает HTML-страницей, 403, 404, 502 или 503.</li>
            <li>Проверьте срок действия подписки и отсутствие лишних пробелов в адресе.</li>
            <li>Если провайдер требует User-Agent, Cookie или HWID, настройте их в ручном импорте.</li>
            <li>HWID, Cookie и другие чувствительные заголовки разрешены только для <code>https://</code>. Переход HTTPS → HTTP блокируется, а при переходе на другой host секретные заголовки удаляются.</li>
          </ul>
          <div class="callout neutral"><strong>Локальный импорт</strong><p>Профиль, добавленный из файла без URL, нельзя обновить с сервера. Импортируйте новый файл вручную.</p></div>
        `,
      },
      {
        id: 'servers',
        group: 'use',
        nav: 'Серверы и задержка',
        kicker: 'Прокси',
        title: 'Что означают пинг, «Самый быстрый», timeout и EOF',
        lead: 'Проверка задержки выполняет HTTP-запрос через прокси. Это полезнее обычного ICMP-пинга, потому что проверяет прохождение реального трафика.',
        body: `
          <div class="status-table" role="table" aria-label="Состояния сервера">
            <div role="row"><span role="cell" class="latency good">84 мс</span><span role="cell"><strong>Ответ получен</strong><small>Чем меньше значение, тем быстрее завершилась проверка.</small></span></div>
            <div role="row"><span role="cell" class="latency pending">•••</span><span role="cell"><strong>Идёт проверка</strong><small>Новое значение ещё не пришло; прежний результат не выдаётся за свежую проверку.</small></span></div>
            <div role="row"><span role="cell" class="latency timeout">timeout</span><span role="cell"><strong>Ответ не получен вовремя</strong><small>Это может быть перегрузка, блокировка, сетевой переход или проблема самого endpoint.</small></span></div>
            <div role="row"><span role="cell" class="latency error">EOF</span><span role="cell"><strong>Соединение закрыто</strong><small>Сервер или промежуточный узел завершил запрос раньше ответа.</small></span></div>
          </div>
          <div class="doc-grid two">
            <article class="info-card"><h3>Самый быстрый</h3><p>Группа URLTest выбирает доступный сервер с наименьшей измеренной задержкой. Выбор может измениться после новой проверки.</p></article>
            <article class="info-card"><h3>Умная маршрутизация</h3><p>Маршрутизирует разные назначения по правилам. Одно число задержки для всей схемы не описывает её работу, поэтому интерфейс не должен выдумывать общий пинг.</p></article>
            <article class="info-card"><h3>Конкретный сервер</h3><p>Используйте его, если нужен постоянный выбор без автоматического переключения URLTest. Сервер можно выбрать ещё до запуска VPN.</p></article>
            <article class="info-card"><h3>Сортировка списка</h3><p>Доступны исходный порядок подписки, задержка, имя и страна. Сортировка меняет только отображение и не переписывает саму подписку.</p></article>
          </div>
          <div class="callout neutral"><strong>Ограничение встроенного ядра 0.2.5.</strong><p>Ядро выполняет HTTP URLTest для группы, но не предоставляет честную отдельную HTTP-проверку одного outbound. Поэтому результаты приходят асинхронно для участников группы, а нажатие на задержку выбранного сервера не следует трактовать как независимый ICMP- или TCP-пинг именно этого endpoint.</p></div>
          <div class="callout warning"><strong>Не запускайте проверку сотен серверов много раз подряд.</strong><p>Каждая проверка создаёт сетевые запросы и расходует процессор, батарею и файловые дескрипторы. Дождитесь завершения текущей сессии.</p></div>
        `,
      },
      {
        id: 'split-routing',
        group: 'use',
        nav: 'Раздельная маршрутизация',
        kicker: 'Android VPN',
        title: 'Какие приложения идут через VPN',
        lead: 'Раздельная маршрутизация применяет список приложений на уровне Android VPN. После изменения режима или списка сервис перезапускается.',
        body: `
          <div class="mode-comparison">
            <article><span class="mode-state off">Выкл.</span><h3>Все приложения через VPN</h3><p>Стандартный режим. Исключения не задаются.</p></article>
            <article><span class="mode-state include">Через VPN</span><h3>Только выбранные приложения</h3><p>Белый список: через туннель идут только отмеченные приложения.</p></article>
            <article><span class="mode-state exclude">Обход VPN</span><h3>Кроме выбранных приложений</h3><p>Чёрный список: отмеченные приложения используют обычную сеть.</p></article>
          </div>
          <h3 class="subheading">Выбор TUN stack</h3>
          <div class="stack-grid">
            <article class="recommended"><span>Сначала попробуйте</span><h3>gVisor</h3><p>Пользовательский сетевой стек. Часто помогает при проблемах совместимости раздельной маршрутизации, но может сильнее нагружать CPU.</p></article>
            <article><span>Зависит от устройства</span><h3>system</h3><p>Системный Android-стек обычно легче, но его поведение зависит от прошивки и оболочки производителя.</p></article>
            <article class="blocked"><span>Проблема совместимости</span><h3>Mixed</h3><p>Автоматический stack доступен в 0.2.5, однако с текущим встроенным ядром на части устройств Android 13/14 раздельная маршрутизация может оставить VPN без трафика.</p></article>
          </div>
          <div class="callout danger"><strong>После смены stack переподключите VPN.</strong><p>Это известная проблема совместимости текущего ядра, а не запрет Android для всех устройств. Если Mixed у вас работает, менять его необязательно. Если timeout появляется только с раздельной маршрутизацией, сначала выберите <code>gVisor</code>, затем при необходимости попробуйте <code>system</code>. Здесь Mixed означает TUN stack, а не локальный HTTP/SOCKS mixed inbound.</p></div>
          <ol class="compact-steps">
            <li><strong>Остановите частые изменения.</strong><span>Несколько быстрых нажатий объединяются, но дайте сервису завершить один перезапуск.</span></li>
            <li><strong>Проверьте выбранные пакеты.</strong><span>Удалённое или клонированное приложение может иметь другое имя пакета.</span></li>
            <li><strong>Перезапустите режим.</strong><span>Если после обновления весь трафик ушёл в <code>timeout</code>, выключите раздельную маршрутизацию, подключитесь и включите её заново.</span></li>
          </ol>
          <div class="callout danger"><strong>VPN подключён, но не работает ни один сервер?</strong><p>Сначала выключите раздельную маршрутизацию. Если трафик появился, экспортируйте диагностику с включённым проблемным режимом и укажите модель телефона, оболочку и версию Android.</p></div>
        `,
      },
      {
        id: 'dns-routing',
        group: 'use',
        nav: 'DNS и маршрутизация',
        kicker: 'Сеть',
        title: 'DNS, правила и защита от обхода',
        lead: 'DNS определяет адрес назначения, а правила маршрутизации решают, через какой outbound пойдёт соединение.',
        body: `
          <div class="doc-grid two">
            <article class="info-card"><h3>Прямой DNS</h3><p>Используется для запросов, которые должны идти через обычную сеть. Доступны DNS устройства, UDP, TCP, DoT и DoH.</p></article>
            <article class="info-card"><h3>DNS через прокси</h3><p>Запросы проходят через выбранный маршрут. DoH часто удобен в сетях, где обычный UDP DNS фильтруется.</p></article>
            <article class="info-card"><h3>Умная маршрутизация</h3><p>Использует локальные наборы правил. Проверяйте статус скачивания и установки данных перед включением.</p></article>
            <article class="info-card"><h3>AdGuard DNS Filter</h3><p>Фильтр компилируется локально. Обновление может занять время и временно использовать больше памяти.</p></article>
          </div>
          <div class="format-strip" aria-label="Поддерживаемые DNS transport"><code>DNS устройства</code><code>UDP</code><code>TCP</code><code>DoT</code><code>DoH</code></div>
          <p class="compact-note">Обычный адрес, например <code>1.1.1.1</code>, принимается как UDP DNS. Вручную добавлять <code>udp://</code> в поле не требуется.</p>
          <div class="callout neutral"><strong>Без необходимости оставьте пресеты.</strong><p>Собственный DNS полезен при конкретной проблеме. Случайное сочетание прямого DNS и маршрутов может раскрывать назначения или ломать резолвинг.</p></div>
        `,
      },
      {
        id: 'backup',
        group: 'use',
        nav: 'Импорт, экспорт и сброс',
        kicker: 'Настройки',
        title: 'Сохраняйте данные перед экспериментами',
        lead: 'Меню «⋮» в настройках содержит прямые действия импорта, экспорта и сброса.',
        body: `
          <div class="option-grid">
            <article><h3>Экспорт настроек</h3><p>Сохраняет безопасные параметры клиента без подписок и VPN-ключей.</p></article>
            <article class="recommended"><span>Рекомендуется</span><h3>Подписки с паролем</h3><p>Профили, выбранные серверы и raw-данные защищаются AES-256-GCM.</p></article>
            <article><h3>Без шифрования</h3><p>Файл содержит VPN-ключи открытым текстом. Используйте только для доверенной локальной передачи.</p></article>
            <article><h3>Сброс настроек</h3><p>Возвращает параметры по умолчанию, но сохраняет подписки, активный профиль и выбранный сервер.</p></article>
          </div>
          <div class="callout warning"><strong>Пароль экспорта восстановить нельзя.</strong><p>Храните его отдельно. Без правильного пароля зашифрованный профиль не импортируется.</p></div>
        `,
      },
      {
        id: 'updates',
        group: 'use',
        nav: 'Обновление клиента',
        kicker: 'OTA',
        title: 'Обновляйте клиент без потери данных',
        lead: 'Встроенный центр обновлений выбирает APK по ABI и минимальной версии Android, а перед установкой проверяет пакет и сертификат подписи. SHA-256 сравнивается, когда официальный release manifest содержит digest.',
        body: `
          <div class="release-panel" data-release-notes data-release-summary aria-live="polite"></div>
          <h3 class="subheading">Безопасное обновление</h3>
          <ul class="check-list">
            <li>Не закрывайте Etonify во время скачивания и проверки APK.</li>
            <li>Android всё равно покажет отдельное системное подтверждение установки.</li>
            <li>Если release manifest недоступен, 0.2.5 не может сравнить SHA-256: скачивайте APK только из официального GitHub Release.</li>
            <li>Если после OTA память временно выше обычного, полностью закройте приложение и откройте снова.</li>
            <li>При несовпадении подписи Android не установит APK поверх существующего приложения.</li>
          </ul>
          <div class="callout success"><strong>Настройки сохраняются при обычном обновлении.</strong><p>Удаление приложения очищает его локальные данные, поэтому перед переустановкой используйте зашифрованный экспорт.</p></div>
        `,
      },
      {
        id: 'troubleshooting',
        group: 'solve',
        nav: 'Решение проблем',
        kicker: 'Диагностика',
        title: 'Сначала определите, на каком этапе всё сломалось',
        lead: 'Не меняйте сразу DNS, сервер, маршрутизацию и режим TUN. Один изменённый параметр даёт полезный результат; пять изменений скрывают причину.',
        body: `
          <div class="trouble-list">
            <details open>
              <summary><span>VPN подключён, но сайты не открываются</span><b>01</b></summary>
              <div><ol><li>Выключите раздельную маршрутизацию.</li><li>Выберите конкретный сервер вместо автоматической группы.</li><li>Переключитесь между Wi-Fi и мобильной сетью, затем переподключите VPN.</li><li>Верните DNS-пресеты и повторите проверку.</li></ol></div>
            </details>
            <details>
              <summary><span>Все серверы показывают timeout или EOF</span><b>02</b></summary>
              <div><ol><li>Дождитесь завершения текущего URLTest.</li><li>Попробуйте подключиться к одному серверу: рабочий трафик важнее отдельного результата проверки.</li><li>Обновите подписку без активного VPN.</li><li>Если проблема появилась после смены сети, отключите и запустите VPN заново.</li></ol></div>
            </details>
            <details>
              <summary><span>Подписка не обновляется</span><b>03</b></summary>
              <div><ol><li>Откройте URL в браузере и посмотрите HTTP-ответ.</li><li>Проверьте DNS, TLS и срок действия ссылки.</li><li>Убедитесь, что провайдер не требует HWID, Cookie или специальный User-Agent.</li><li>Экспортируйте лог сразу после ошибки.</li></ol></div>
            </details>
            <details>
              <summary><span>После перезапуска выбран другой сервер</span><b>04</b></summary>
              <div><p>Сначала выберите профиль, затем сервер. Если используется «Самый быстрый», группа имеет право выбрать другой endpoint после свежей проверки. Для постоянного выбора укажите конкретный сервер.</p></div>
            </details>
            <details>
              <summary><span>Высокое потребление памяти</span><b>05</b></summary>
              <div><p>После обновления, большой подписки или проверки сотен серверов память может временно вырасти. Остановите VPN, полностью закройте приложение и проверьте ещё раз. Для отчёта снимайте PSS/RSS серией измерений, а не одним пиковым числом.</p></div>
            </details>
          </div>
        `,
      },
      {
        id: 'diagnostics',
        group: 'solve',
        nav: 'Логи и отчёт',
        kicker: 'Помощь',
        title: 'Хороший отчёт экономит несколько часов',
        lead: 'Экспортируйте логи сразу после воспроизведения — до очистки данных, переустановки и десятка случайных изменений.',
        body: `
          <div class="report-template">
            <h3>Что приложить</h3>
            <ul>
              <li>Версию Etonify и способ установки.</li>
              <li>Модель устройства, версию Android и оболочку: HyperOS, MIUI, Realme UI и т. п.</li>
              <li>Точный режим: VPN/локальный прокси, раздельная маршрутизация, Wi-Fi/мобильная сеть.</li>
              <li>Короткие шаги воспроизведения и ожидаемый результат.</li>
              <li>Экспорт диагностики после появления ошибки.</li>
            </ul>
          </div>
          <div class="callout warning"><strong>Проверьте файл перед публикацией.</strong><p>В 0.2.5 известные секреты маскируются и во Flutter-логах, и в native-диагностике. Но стороннее ядро или сервер всё равно может записать неожиданный формат данных, поэтому не публикуйте отчёт без просмотра.</p></div>
          <div class="contact-banner"><span><span class="material-symbols-rounded" aria-hidden="true">support_agent</span></span><div><strong>Отправить логи или задать вопрос</strong><p>Опишите проблему, приложите шаги воспроизведения и экспорт диагностики в Etonify Direct.</p></div><a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer">Открыть чат</a></div>
        `,
      },
      {
        id: 'privacy',
        group: 'project',
        nav: 'Приватность и безопасность',
        kicker: 'Данные',
        title: 'Что хранится и куда отправляется',
        lead: 'Etonify не содержит рекламы и аналитических SDK. Подписки, настройки и диагностика хранятся локально в приватном каталоге приложения, пока пользователь сам их не экспортирует.',
        body: `
          <div class="doc-grid two">
            <article class="info-card"><h3>Локальное хранение</h3><p>Настройки, подписки, пароли и ключи в Hive защищаются AES-256-GCM. 32-байтовый ключ данных обёрнут неэкспортируемым ключом Android Keystore.</p></article>
            <article class="info-card"><h3>Сетевые запросы</h3><p>Клиент обращается к сервису подписки, источникам правил, GitHub и через ядро — к сервисам определения внешнего IP и страны.</p></article>
            <article class="info-card"><h3>HWID</h3><p>Включается только после явного выбора пользователя и отправляется только по HTTPS. При cross-origin redirect чувствительные заголовки удаляются.</p></article>
            <article class="info-card"><h3>Логи</h3><p>Хранятся локально до экспорта. Flutter и native используют маскирование известных URL, UUID, токенов, Cookie и IP-адресов, но отчёт всё равно нужно просмотреть.</p></article>
          </div>
          <div class="callout neutral"><strong>Облачное резервное копирование Android отключено.</strong><p>Список установленных приложений используется локально для выбора split tunneling. URL подписки, JSON и данные локального прокси очищаются из буфера примерно через минуту, если пользователь не скопировал поверх них другое значение. Экспортированную ссылку отдельного proxy всё равно лучше удалить из буфера вручную.</p></div>
          <p class="text-link-row"><a href="https://github.com/yamixdev/Etonify/security" target="_blank" rel="noreferrer">Сообщить об уязвимости →</a></p>
        `,
      },
      {
        id: 'faq',
        group: 'project',
        nav: 'Частые вопросы',
        kicker: 'FAQ',
        title: 'Короткие ответы',
        lead: 'То, что чаще всего приходится объяснять отдельно.',
        body: `
          <div class="trouble-list faq-list">
            <details><summary><span>Etonify выдаёт бесплатные серверы?</span><b>+</b></summary><div><p>Нет. Это клиент для вашей подписки или конфигурации.</p></div></details>
            <details><summary><span>Почему пинг отличается от другого клиента?</span><b>+</b></summary><div><p>Методика, проверочный URL, время ожидания, маршрут и момент измерения могут отличаться. Etonify проверяет HTTP-трафик через прокси, а не ICMP до IP сервера.</p></div></details>
            <details><summary><span>Можно одновременно включить системный VPN и локальный прокси?</span><b>+</b></summary><div><p>Основной режим подключения выбирается в настройках inbound. Локальный HTTP/SOCKS-прокси нужен приложениям и устройствам, которые умеют подключаться к нему вручную.</p></div></details>
            <details><summary><span>Почему Android показывает VPN даже без трафика?</span><b>+</b></summary><div><p>Значок означает, что TUN-интерфейс создан. Он не доказывает, что выбранный proxy endpoint отвечает и маршруты настроены правильно.</p></div></details>
            <details><summary><span>Где задать вопрос или отправить логи?</span><b>+</b></summary><div><p>Напишите в <a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer">Etonify Direct</a>. Для воспроизводимой ошибки приложите модель устройства, версию Android, шаги и свежий экспорт диагностики.</p></div></details>
          </div>
        `,
      },
      {
        id: 'support',
        group: 'project',
        nav: 'Ссылки и поддержка',
        kicker: 'MeowTeam',
        title: 'Исходники, релизы и связь',
        lead: 'Если ответ уже есть в документации, приложите ссылку на раздел. Если нет — помогите сделать следующий ответ полезнее для всех.',
        body: `
          <div class="link-grid">
            <a href="https://github.com/yamixdev/Etonify" target="_blank" rel="noreferrer"><span>Исходный код</span><small>yamixdev/Etonify</small><b>↗</b></a>
            <a href="https://github.com/yamixdev/Etonify/releases" target="_blank" rel="noreferrer"><span>Скачать APK</span><small>GitHub Releases</small><b>↗</b></a>
            <a href="https://github.com/yamixdev/Etonify/issues" target="_blank" rel="noreferrer"><span>Сообщить об ошибке</span><small>GitHub Issues</small><b>↗</b></a>
            <a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer"><span>Связаться с командой</span><small>Etonify Direct</small><b>↗</b></a>
          </div>
          <div class="callout neutral"><strong>Куда писать?</strong><p>В <a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer">Etonify Direct</a> можно задать вопрос или передать логи. Канал <a href="https://t.me/etonify" target="_blank" rel="noreferrer">@etonify</a> используется для новостей.</p></div>
          <footer class="doc-footer"><img src="assets/etonify-logo.svg" width="28" height="28" alt=""/><p>Etonify — открытый Android VPN-клиент. Документация относится к версии 0.2.5.</p></footer>
        `,
      },
    ],
  },

  en: {
    meta: {
      title: 'Etonify — documentation',
      description: 'Installation, subscriptions, servers, routing, and Etonify troubleshooting.',
    },
    ui: {
      brandKind: 'Documentation',
      menuOpen: 'Open navigation',
      menuClose: 'Close navigation',
      searchTrigger: 'Find an answer',
      searchTitle: 'Search documentation',
      searchPlaceholder: 'What is not working?',
      searchHint: 'Enter at least two characters',
      searchEmpty: 'Nothing found. Try a shorter description.',
      searchResults: (count) => `${count} result${count === 1 ? '' : 's'}`,
      themeButton: 'Choose theme',
      themeSystem: 'Use system setting',
      themeLight: 'Light',
      themeDark: 'Dark',
      version: 'Version 0.2.5',
      platform: 'Android 8.0+',
      copy: 'Copy',
      copied: 'Copied',
      toTop: 'Back to top',
      openSection: 'Open section',
      releaseLatest: 'Latest release',
      releaseLoading: 'Loading release notes',
      releaseSource: 'Data from GitHub Releases',
      releasePublished: 'Published',
      releaseOpen: 'Open release',
      releaseUnavailable: 'Could not load changes from GitHub',
      releaseUnavailableHint: 'Check your connection or open the releases page directly.',
      releaseRetry: 'Try again',
      releaseShowChanges: 'Show changes',
      releaseDialogTitle: 'What changed',
      releaseDialogClose: 'Close release notes',
    },
    groups: {
      start: 'Getting started',
      use: 'Using Etonify',
      solve: 'Troubleshooting',
      project: 'Project',
    },
    hero: {
      eyebrow: 'Documentation · 0.2.5',
      title: 'Setup without guesswork.',
      lead: 'Installation, subscriptions, server selection, split tunneling, and clear actions for the moment when VPN says connected but traffic does not work.',
      primary: 'Start setup',
      secondary: 'Solve a problem',
      note: 'Etonify is a client. It does not sell or provide VPN servers.',
      routeLabel: 'How a connection travels',
      nodes: [
        { label: 'Subscription', detail: 'your configuration' },
        { label: 'Server', detail: 'selection and URLTest' },
        { label: 'VPN', detail: 'Android TUN' },
        { label: 'Internet', detail: 'application traffic' },
      ],
    },
    sections: [
      {
        id: 'start',
        group: 'start',
        nav: 'What Etonify is',
        kicker: 'Before you begin',
        title: 'A client for your subscriptions',
        lead: 'Etonify creates an Android VPN tunnel and routes traffic through servers from a subscription or configuration you add.',
        body: `
          <div class="doc-grid three">
            <article class="info-card"><span class="card-mark">01</span><h3>Android only</h3><p>The production target is Android 8.0 and newer. Other platform folders in the source tree are not release targets yet.</p></article>
            <article class="info-card"><span class="card-mark">02</span><h3>Bring a subscription</h3><p>The app does not provide servers. Use a subscription or configuration you own or are allowed to use.</p></article>
            <article class="info-card"><span class="card-mark">03</span><h3>Open source</h3><p>The client is Apache-2.0 licensed. Source code, changes, and builds are published on GitHub.</p></article>
          </div>
          <div class="callout neutral"><strong>The project is evolving.</strong><p>Keep a working subscription and settings backup before updating. If you hit a regression, export diagnostics before reinstalling the app.</p></div>
        `,
      },
      {
        id: 'features',
        group: 'start',
        nav: 'Features',
        kicker: 'What the client does',
        title: 'VPN, subscriptions, and diagnostics in one client',
        lead: 'Etonify is Android-first and combines a normal VPN tunnel, a local proxy, subscription management, routing, and tools for investigating failures.',
        body: `
          <div class="feature-grid">
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">vpn_key</span></span><div><h3>System VPN TUN</h3><p>Routes Android application traffic through the modified sing-box core and the selected server.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">devices</span></span><div><h3>Local HTTP/SOCKS</h3><p>A separate mixed proxy inbound for applications or devices that connect to a proxy manually.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">add_link</span></span><div><h3>Subscription import</h3><p>URL, QR code, file, clipboard, deep links, sing-box/Xray, and several Happ formats.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">speed</span></span><div><h3>Proxy list</h3><p>Country flags, latency, sorting, source order, URLTest, and server selection before VPN starts.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">alt_route</span></span><div><h3>Routing and DNS</h3><p>Per-app split tunneling, DNS presets, Smart routing, and a locally built AdGuard DNS Filter.</p></div></article>
            <article class="feature-card"><span><span class="material-symbols-rounded" aria-hidden="true">description</span></span><div><h3>Runtime visibility</h3><p>Session speed and totals, active profile, OTA updates, runtime logs, and diagnostics export.</p></div></article>
          </div>
          <div class="callout neutral"><strong>The project is in early public development.</strong><p>Android is currently the only production target. This documentation describes patch 0.2.5 and the client behavior prepared for that release.</p></div>
        `,
      },
      {
        id: 'install',
        group: 'start',
        nav: 'Installation',
        kicker: 'Step 1',
        title: 'Install the APK for your device architecture',
        lead: 'The safest source is the Releases page of the main Etonify repository.',
        body: `
          <ol class="steps">
            <li><span>1</span><div><h3>Open the latest release</h3><p>Go to <a href="https://github.com/yamixdev/Etonify/releases/latest" target="_blank" rel="noreferrer">GitHub Releases</a>. Avoid APKs from unofficial mirrors.</p></div></li>
            <li><span>2</span><div><h3>Choose a file</h3><p>Use the universal APK if you do not know your architecture. Most current Android devices use arm64-v8a.</p></div></li>
            <li><span>3</span><div><h3>Allow installation</h3><p>Android may ask for temporary permission to install from your browser or file manager. You can revoke it afterward.</p></div></li>
            <li><span>4</span><div><h3>Approve VPN access</h3><p>Android shows a system VPN prompt on the first connection. TUN mode cannot work without it.</p></div></li>
          </ol>
          <div class="callout warning"><strong>Cannot install over an older build?</strong><p>The APK may have a different signature or lower version code. Export your data, uninstall the old build, then install the new one.</p></div>
          <div class="command-block"><div><span>Install with ADB</span></div><pre><code>adb install -r app-arm64-v8a-release.apk</code></pre></div>
        `,
      },
      {
        id: 'quick-start',
        group: 'start',
        nav: 'First connection',
        kicker: 'Step 2',
        title: 'Subscription → server → connect',
        lead: 'Add a subscription, choose a profile and server, then press the main connection button.',
        body: `
          <div class="flow-list">
            <article><span class="flow-icon"><span class="material-symbols-rounded" aria-hidden="true">add_link</span></span><div><h3>Add a subscription</h3><p>Press “+” on the home screen. Paste a link, scan a QR code, choose a file, or use manual input.</p></div></article>
            <article><span class="flow-icon"><span class="material-symbols-rounded" aria-hidden="true">swap_vert</span></span><div><h3>Choose a server</h3><p>Open the proxy panel. Select a specific endpoint, “Lowest latency,” or “Smart routing.”</p></div></article>
            <article><span class="flow-icon"><span class="material-symbols-rounded" aria-hidden="true">power_settings_new</span></span><div><h3>Start VPN</h3><p>Press the large connection button and approve the system VPN request if Android shows it.</p></div></article>
          </div>
          <div class="callout success"><strong>You can select a server while VPN is off.</strong><p>Etonify saves the selection in the subscription and uses it at the next start.</p></div>
          <div class="callout neutral"><strong>VPN TUN and local proxy are separate modes.</strong><p>The 0.2.5 UI selects one primary mode. A local HTTP/SOCKS inbound does not redirect anything by itself: configure its address and port manually in the app or another device. It always uses the username <code>etonify</code> and a client-generated password, even on <code>127.0.0.1</code>.</p></div>
        `,
      },
      {
        id: 'subscriptions',
        group: 'use',
        nav: 'Subscriptions',
        kicker: 'Profiles',
        title: 'Adding and updating subscriptions',
        lead: 'Etonify accepts regular URLs, individual keys, sing-box/Xray configurations, local files, and several Happ formats.',
        body: `
          <div class="option-grid">
            <article><h3>Clipboard</h3><p>Copy the provider URL and choose clipboard import. The client detects supported formats automatically.</p></article>
            <article><h3>QR code</h3><p>Camera access is used only while scanning. Verify the resulting address before confirming.</p></article>
            <article><h3>File</h3><p>Use a local sing-box/Xray JSON when the configuration should not be fetched from the network.</p></article>
            <article><h3>Happ</h3><p><code>happ://add</code> and the <code>crypt*</code> family are supported. HWID is sent only after explicit consent.</p></article>
          </div>
          <h3 class="subheading">Deep links and Happ</h3>
          <div class="format-strip" aria-label="Supported link schemes">
            <code>etonify://import</code><code>happ://add</code><code>happ://crypt*</code><code>sing-box://import-remote-profile</code>
          </div>
          <p class="compact-note">The Happ decryptor understands <code>crypt</code>, <code>crypt2</code>, <code>crypt3</code>, <code>crypt4</code>, and <code>crypt5</code>. If a provider requires HWID, the client asks for explicit approval first.</p>
          <h3 class="subheading">If a subscription cannot be added</h3>
          <ul class="check-list">
            <li>Open the URL in a browser and make sure the server is not returning HTML, 403, 404, 502, or 503.</li>
            <li>Check expiry and remove accidental spaces from the address.</li>
            <li>If the provider requires a User-Agent, Cookie, or HWID, configure it in manual import.</li>
            <li>HWID, Cookies, and other sensitive headers are HTTPS-only. HTTPS → HTTP redirects are blocked, and sensitive headers are removed when the host changes.</li>
          </ul>
          <div class="callout neutral"><strong>Local imports</strong><p>A file profile without a source URL cannot refresh itself. Import a newer file manually.</p></div>
        `,
      },
      {
        id: 'servers',
        group: 'use',
        nav: 'Servers and latency',
        kicker: 'Proxies',
        title: 'Latency, “Lowest,” timeout, and EOF',
        lead: 'Latency checks make an HTTP request through the proxy. This is more useful than ICMP to the server IP because it verifies real traffic flow.',
        body: `
          <div class="status-table" role="table" aria-label="Server states">
            <div role="row"><span role="cell" class="latency good">84 ms</span><span role="cell"><strong>Response received</strong><small>A smaller value means the request completed sooner.</small></span></div>
            <div role="row"><span role="cell" class="latency pending">•••</span><span role="cell"><strong>Check in progress</strong><small>A fresh result has not arrived; an old value is not presented as new.</small></span></div>
            <div role="row"><span role="cell" class="latency timeout">timeout</span><span role="cell"><strong>No response before deadline</strong><small>Possible overload, filtering, network handover, or endpoint failure.</small></span></div>
            <div role="row"><span role="cell" class="latency error">EOF</span><span role="cell"><strong>Connection closed early</strong><small>The server or an intermediate hop ended the request before a response.</small></span></div>
          </div>
          <div class="doc-grid two">
            <article class="info-card"><h3>Lowest latency</h3><p>The URLTest group selects an available server with the lowest measured delay. A later check may change that selection.</p></article>
            <article class="info-card"><h3>Smart routing</h3><p>Different destinations can use different routes. A single number cannot describe the whole policy, so the UI should not invent one.</p></article>
            <article class="info-card"><h3>Specific server</h3><p>Choose one for a stable selection without automatic URLTest switching. The server can be selected before VPN starts.</p></article>
            <article class="info-card"><h3>List sorting</h3><p>Source order, latency, name, and country are available. Sorting changes the view only; it does not rewrite the subscription.</p></article>
          </div>
          <div class="callout neutral"><strong>Bundled-core limitation in 0.2.5.</strong><p>The core performs HTTP URLTest for a group but does not expose an honest targeted HTTP check for one outbound. Results therefore arrive asynchronously for group members; tapping the selected server latency should not be interpreted as an independent ICMP or TCP ping of that endpoint.</p></div>
          <div class="callout warning"><strong>Do not repeatedly test hundreds of servers.</strong><p>Each run creates network requests and consumes CPU, battery, and file descriptors. Let the current session finish.</p></div>
        `,
      },
      {
        id: 'split-routing',
        group: 'use',
        nav: 'Split tunneling',
        kicker: 'Android VPN',
        title: 'Choose which apps use VPN',
        lead: 'Split tunneling applies an application list at the Android VPN layer. Changing the mode or list restarts the service.',
        body: `
          <div class="mode-comparison">
            <article><span class="mode-state off">Off</span><h3>All apps use VPN</h3><p>The standard mode with no application exceptions.</p></article>
            <article><span class="mode-state include">Through VPN</span><h3>Only selected apps</h3><p>Allowlist mode: only marked apps enter the tunnel.</p></article>
            <article><span class="mode-state exclude">Bypass VPN</span><h3>All except selected apps</h3><p>Denylist mode: marked apps use the regular network.</p></article>
          </div>
          <h3 class="subheading">Choose a TUN stack</h3>
          <div class="stack-grid">
            <article class="recommended"><span>Try first</span><h3>gVisor</h3><p>A userspace network stack that often helps with split-tunneling compatibility, at the cost of potentially higher CPU use.</p></article>
            <article><span>Device dependent</span><h3>system</h3><p>The Android system stack is usually lighter, but behavior depends on firmware and the vendor skin.</p></article>
            <article class="blocked"><span>Compatibility issue</span><h3>Mixed</h3><p>The automatic stack is available in 0.2.5, but with the bundled core split tunneling may leave VPN without traffic on some Android 13/14 devices.</p></article>
          </div>
          <div class="callout danger"><strong>Reconnect VPN after changing the stack.</strong><p>This is a known compatibility problem in the current core, not a universal Android restriction. If Mixed works on your device, you do not need to change it. If timeout appears only with split tunneling, try <code>gVisor</code> first and then <code>system</code>. Mixed here means the TUN stack, not the local HTTP/SOCKS mixed inbound.</p></div>
          <ol class="compact-steps">
            <li><strong>Stop rapid changes.</strong><span>Quick taps are coalesced, but allow one service restart to finish.</span></li>
            <li><strong>Verify package names.</strong><span>A removed or cloned app may use a different Android package.</span></li>
            <li><strong>Reapply the mode.</strong><span>If all traffic times out after an update, disable split tunneling, connect once, then enable it again.</span></li>
          </ol>
          <div class="callout danger"><strong>VPN connects but no server works?</strong><p>Disable split tunneling first. If traffic returns, export diagnostics with the failing mode enabled and include the phone model, Android skin, and version.</p></div>
        `,
      },
      {
        id: 'dns-routing',
        group: 'use',
        nav: 'DNS and routing',
        kicker: 'Network',
        title: 'DNS, rules, and leak protection',
        lead: 'DNS resolves the destination; routing rules decide which outbound carries the connection.',
        body: `
          <div class="doc-grid two">
            <article class="info-card"><h3>Direct DNS</h3><p>Used for requests that should leave through the regular network. Device DNS, UDP, TCP, DoT, and DoH are supported.</p></article>
            <article class="info-card"><h3>Proxy DNS</h3><p>Requests follow the selected route. DoH can help on networks that filter plain UDP DNS.</p></article>
            <article class="info-card"><h3>Smart routing</h3><p>Uses local rule sets. Check download and installation status before enabling them.</p></article>
            <article class="info-card"><h3>AdGuard DNS Filter</h3><p>The filter is compiled locally. Updating it can temporarily take extra memory and time.</p></article>
          </div>
          <div class="format-strip" aria-label="Supported DNS transports"><code>Device DNS</code><code>UDP</code><code>TCP</code><code>DoT</code><code>DoH</code></div>
          <p class="compact-note">A plain address such as <code>1.1.1.1</code> is accepted as UDP DNS. You do not need to add <code>udp://</code> manually.</p>
          <div class="callout neutral"><strong>Keep the presets unless you have a reason to change them.</strong><p>A random combination of direct DNS and routing rules can leak destination lookups or break resolution.</p></div>
        `,
      },
      {
        id: 'backup',
        group: 'use',
        nav: 'Import, export, and reset',
        kicker: 'Settings',
        title: 'Back up data before experimenting',
        lead: 'The “⋮” menu in Settings provides direct import, export, and reset actions.',
        body: `
          <div class="option-grid">
            <article><h3>Export settings</h3><p>Saves safe client preferences without subscriptions or VPN keys.</p></article>
            <article class="recommended"><span>Recommended</span><h3>Password-protected profiles</h3><p>Profiles, selected servers, and raw data are protected with AES-256-GCM.</p></article>
            <article><h3>Plain export</h3><p>The file contains VPN keys in readable form. Use it only for trusted local transfer.</p></article>
            <article><h3>Reset settings</h3><p>Restores defaults while keeping subscriptions, the active profile, and the selected server.</p></article>
          </div>
          <div class="callout warning"><strong>An export password cannot be recovered.</strong><p>Store it separately. The encrypted profile cannot be imported without the correct password.</p></div>
        `,
      },
      {
        id: 'updates',
        group: 'use',
        nav: 'Updating the client',
        kicker: 'OTA',
        title: 'Update without losing data',
        lead: 'The update center chooses an APK by ABI and minimum Android version, then checks its package and signing certificate before installation. SHA-256 is compared when the official release manifest contains a digest.',
        body: `
          <div class="release-panel" data-release-notes data-release-summary aria-live="polite"></div>
          <h3 class="subheading">Update safely</h3>
          <ul class="check-list">
            <li>Do not close Etonify while an APK is downloading or being verified.</li>
            <li>Android always shows a separate system installation confirmation.</li>
            <li>If the release manifest is unavailable, 0.2.5 cannot compare SHA-256; download APKs only from the official GitHub Release.</li>
            <li>If memory is temporarily high after OTA, fully close the app and open it again.</li>
            <li>Android will reject an APK signed with a different certificate.</li>
          </ul>
          <div class="callout success"><strong>A regular update preserves settings.</strong><p>Uninstalling clears local application data, so use encrypted export before reinstalling.</p></div>
        `,
      },
      {
        id: 'troubleshooting',
        group: 'solve',
        nav: 'Troubleshooting',
        kicker: 'Diagnostics',
        title: 'Identify the stage that failed first',
        lead: 'Do not change DNS, server, routing, and TUN mode at once. One controlled change gives evidence; five changes hide the cause.',
        body: `
          <div class="trouble-list">
            <details open><summary><span>VPN connects, but websites do not open</span><b>01</b></summary><div><ol><li>Disable split tunneling.</li><li>Select a specific server instead of an automatic group.</li><li>Switch between Wi-Fi and mobile data, then reconnect VPN.</li><li>Restore the DNS presets and test again.</li></ol></div></details>
            <details><summary><span>Every server shows timeout or EOF</span><b>02</b></summary><div><ol><li>Wait for the current URLTest to finish.</li><li>Try connecting to one server: working traffic matters more than a single check result.</li><li>Refresh the subscription with VPN off.</li><li>If this started after a network handover, stop and start VPN.</li></ol></div></details>
            <details><summary><span>A subscription does not refresh</span><b>03</b></summary><div><ol><li>Open the URL in a browser and inspect the HTTP response.</li><li>Check DNS, TLS, and link expiry.</li><li>Confirm whether the provider requires HWID, Cookie, or a special User-Agent.</li><li>Export logs immediately after the failure.</li></ol></div></details>
            <details><summary><span>A different server is selected after restart</span><b>04</b></summary><div><p>Select the profile first, then the server. “Lowest latency” is allowed to choose another endpoint after a fresh check. Select a concrete server for a fixed choice.</p></div></details>
            <details><summary><span>Memory usage is high</span><b>05</b></summary><div><p>Updates, large subscriptions, and mass URLTest can temporarily increase memory use. Stop VPN, fully close the app, and measure again. A series of PSS/RSS samples is more useful than one peak.</p></div></details>
          </div>
        `,
      },
      {
        id: 'diagnostics',
        group: 'solve',
        nav: 'Logs and reports',
        kicker: 'Support',
        title: 'A good report saves hours',
        lead: 'Export logs immediately after reproducing the issue—before clearing data, reinstalling, or changing many settings.',
        body: `
          <div class="report-template"><h3>Include these details</h3><ul><li>Etonify version and installation method.</li><li>Device model, Android version, and skin such as HyperOS, MIUI, or Realme UI.</li><li>Exact mode: VPN/local proxy, split tunneling, Wi-Fi/mobile.</li><li>Short reproduction steps and expected result.</li><li>A diagnostics export captured after the error.</li></ul></div>
          <div class="callout warning"><strong>Review the file before publishing.</strong><p>In 0.2.5, known secrets are redacted in both Flutter logs and native diagnostics. A third-party core or server may still emit an unexpected data format, so never publish a report without reviewing it.</p></div>
          <div class="contact-banner"><span><span class="material-symbols-rounded" aria-hidden="true">support_agent</span></span><div><strong>Send logs or ask a question</strong><p>Describe the issue, include reproduction steps, and attach the diagnostics export in Etonify Direct.</p></div><a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer">Open chat</a></div>
        `,
      },
      {
        id: 'privacy',
        group: 'project',
        nav: 'Privacy and security',
        kicker: 'Data',
        title: 'What is stored and where requests go',
        lead: 'Etonify contains no advertising or analytics SDKs. Subscriptions, settings, and diagnostics remain on the device.',
        body: `
          <div class="doc-grid two">
            <article class="info-card"><h3>Local storage</h3><p>Settings, subscriptions, passwords, and keys in Hive use AES-256-GCM. The 32-byte data key is wrapped by a non-exportable Android Keystore key.</p></article>
            <article class="info-card"><h3>Network requests</h3><p>The client contacts your subscription service, rule sources, GitHub, and—through the core—services used to determine external IP and country.</p></article>
            <article class="info-card"><h3>HWID</h3><p>Enabled only after an explicit user choice and sent only over HTTPS. Sensitive headers are removed on cross-origin redirects.</p></article>
            <article class="info-card"><h3>Logs</h3><p>Stored locally until export. Flutter and native code redact known URLs, UUIDs, tokens, Cookies, and IP addresses, but you should still review the report.</p></article>
          </div>
          <div class="callout neutral"><strong>Android cloud backup is disabled.</strong><p>The installed-app list stays local and is used for split-tunneling selection. Subscription URLs, JSON, and local-proxy credentials are cleared from the clipboard after about one minute if unchanged. A separately shared proxy link should still be removed manually.</p></div>
          <p class="text-link-row"><a href="https://github.com/yamixdev/Etonify/security" target="_blank" rel="noreferrer">Report a security issue →</a></p>
        `,
      },
      {
        id: 'faq',
        group: 'project',
        nav: 'FAQ',
        kicker: 'FAQ',
        title: 'Short answers',
        lead: 'Questions that otherwise need a separate explanation every time.',
        body: `
          <div class="trouble-list faq-list">
            <details><summary><span>Does Etonify provide free servers?</span><b>+</b></summary><div><p>No. It is a client for your own subscription or configuration.</p></div></details>
            <details><summary><span>Why is latency different from another client?</span><b>+</b></summary><div><p>The method, URL, timeout, route, and measurement time may differ. Etonify tests HTTP through the proxy rather than ICMP to the server IP.</p></div></details>
            <details><summary><span>Can system VPN and local proxy run together?</span><b>+</b></summary><div><p>The main inbound mode is selected in settings. The local HTTP/SOCKS proxy is for apps or devices that connect to it manually.</p></div></details>
            <details><summary><span>Why does Android show VPN when traffic is broken?</span><b>+</b></summary><div><p>The icon means a TUN interface exists. It does not prove that the selected proxy endpoint responds or that routes are correct.</p></div></details>
            <details><summary><span>Where can I ask a question or send logs?</span><b>+</b></summary><div><p>Use <a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer">Etonify Direct</a>. For a reproducible bug, include the device model, Android version, steps, and a fresh diagnostics export.</p></div></details>
          </div>
        `,
      },
      {
        id: 'support',
        group: 'project',
        nav: 'Links and support',
        kicker: 'MeowTeam',
        title: 'Source, releases, and contact',
        lead: 'If the answer exists here, link to the section. If it does not, help make the next answer useful for everyone.',
        body: `
          <div class="link-grid">
            <a href="https://github.com/yamixdev/Etonify" target="_blank" rel="noreferrer"><span>Source code</span><small>yamixdev/Etonify</small><b>↗</b></a>
            <a href="https://github.com/yamixdev/Etonify/releases" target="_blank" rel="noreferrer"><span>Download APK</span><small>GitHub Releases</small><b>↗</b></a>
            <a href="https://github.com/yamixdev/Etonify/issues" target="_blank" rel="noreferrer"><span>Report a bug</span><small>GitHub Issues</small><b>↗</b></a>
            <a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer"><span>Contact the team</span><small>Etonify Direct</small><b>↗</b></a>
          </div>
          <div class="callout neutral"><strong>Where should I write?</strong><p>Use <a href="https://t.me/etonify?direct" target="_blank" rel="noreferrer">Etonify Direct</a> for questions or logs. The <a href="https://t.me/etonify" target="_blank" rel="noreferrer">@etonify</a> channel is for news. YamixDEV maintains the client; dudosxdev maintains the modified sing-box core.</p></div>
          <footer class="doc-footer"><img src="assets/etonify-logo.svg" width="28" height="28" alt=""/><p>Etonify is an open-source Android VPN client. This documentation covers version 0.2.5.</p></footer>
        `,
      },
    ],
  },
};
