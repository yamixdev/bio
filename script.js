document.addEventListener('DOMContentLoaded', () => {

    const navContainer = document.querySelector('.nav-container');
    const indicator = document.getElementById('nav-indicator');
    const sections = document.querySelectorAll('.tab-content');
    
    function moveIndicator(el) {
        if (!el || !indicator) return;
        const rect = el.getBoundingClientRect();
        const containerRect = navContainer.getBoundingClientRect();
        indicator.style.width = `${rect.width}px`;
        indicator.style.left = `${(rect.left - containerRect.left) + navContainer.scrollLeft}px`;
    }

    document.addEventListener('click', (e) => {
        const navBtn = e.target.closest('.nav-btn');
        if (navBtn) {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            navBtn.classList.add('active');
            navBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            setTimeout(() => moveIndicator(navBtn), 50);

            const tabId = navBtn.getAttribute('data-tab');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(tabId)?.classList.add('active');
        }
        
        // Обычные ссылки (новая вкладка)
        const linkElem = e.target.closest('[data-url]');
        if (linkElem) window.open(linkElem.getAttribute('data-url'), '_blank');

        // Прямое скачивание
        const downloadElem = e.target.closest('[data-download]');
        if (downloadElem) {
            e.preventDefault();
            const url = downloadElem.getAttribute('data-download');
            showToast('Скачивание началось...', 'download', '#3b82f6');
            const a = document.createElement('a');
            a.href = url;
            a.download = ''; 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        // Переход на GitHub репозитории
        const githubElem = e.target.closest('[data-github]');
        if (githubElem) {
            e.preventDefault();
            const url = githubElem.getAttribute('data-github');
            showToast('Переход на GitHub репозиторий...', 'code', '#fff');
            setTimeout(() => window.open(url, '_blank'), 600);
        }
        
        const copyElem = e.target.closest('[data-copy]');
        if (copyElem) {
            navigator.clipboard.writeText(copyElem.getAttribute('data-copy')).then(() => {
                showToast('Ссылка скопирована!');
            }).catch(() => showToast('Ошибка копирования', 'error', '#ef4444'));
        }
    });

    setTimeout(() => moveIndicator(document.querySelector('.nav-btn.active')), 200);
    window.addEventListener('resize', () => moveIndicator(document.querySelector('.nav-btn.active')));
    navContainer.addEventListener('scroll', () => moveIndicator(document.querySelector('.nav-btn.active')));

    document.querySelectorAll('.soft-date').forEach(el => {
        const rawDate = el.getAttribute('data-date');
        if (!rawDate) return;
        const diffDays = Math.floor(Math.abs(new Date() - new Date(rawDate)) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) el.innerText = 'Сегодня';
        else if (diffDays === 1) el.innerText = 'Вчера';
        else if (diffDays < 7) el.innerText = `${diffDays} дн. назад`;
        else {
            const d = new Date(rawDate);
            el.innerText = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
        }
    });

    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMsg = document.getElementById('toast-msg');
    let toastTimer;

    function showToast(msg, icon = 'check_circle', color = '#1DB954') {
        toastMsg.innerText = msg;
        toastIcon.innerText = icon;
        toastIcon.style.color = color;
        toast.style.transform = ''; 
        toast.classList.add('active');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('active'), 3000);
    }

    let toastStartX = 0;
    toast.addEventListener('touchstart', e => toastStartX = e.touches[0].clientX, {passive: true});
    toast.addEventListener('touchmove', e => {
        const diffX = e.touches[0].clientX - toastStartX;
        if(Math.abs(diffX) > 10) toast.style.transform = `translateX(calc(-50% + ${diffX}px)) translateY(0)`;
    }, {passive: true});
    toast.addEventListener('touchend', e => {
        const diffX = e.changedTouches[0].clientX - toastStartX;
        if(Math.abs(diffX) > 50) {
            toast.classList.remove('active');
            setTimeout(() => toast.style.transform = '', 300);
        } else {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }
    });

    const overlay = document.getElementById('modal-overlay');
    let currentModal = null;
    let modalCloseTimeout = null;
    
    function openModal(id) {
        clearTimeout(modalCloseTimeout);
        document.querySelectorAll('.modal-window').forEach(m => { 
            m.style.display = 'none'; 
            m.classList.remove('show'); 
            m.style.transform = ''; 
        });
        currentModal = document.getElementById(id);
        if (overlay && currentModal) {
            overlay.classList.add('active');
            currentModal.style.display = 'flex';
            void currentModal.offsetWidth; 
            currentModal.classList.add('show');
            document.body.style.overflow = 'hidden'; 
            if(id === 'modal-hiddify') {
                document.querySelectorAll('.hiddify-view').forEach(v => v.classList.remove('active'));
                document.getElementById('h-view-main').classList.add('active');
            }
        }
    }

    function closeModal() {
        if (!currentModal) return;
        currentModal.classList.remove('show'); // Триггерит CSS анимацию (сворачивание вниз)
        const modalToClose = currentModal;
        currentModal = null; 
        
        // Ждем пока анимация окна завершится, затем скрываем фон
        modalCloseTimeout = setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => {
                modalToClose.style.display = 'none';
                modalToClose.style.transform = '';
                document.body.style.overflow = '';
            }, 300);
        }, 150); 
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-modal]');
        if (trigger) openModal(trigger.getAttribute('data-modal'));
        if (e.target.closest('.modal-close') || e.target === overlay) closeModal();
    });

    let modalStartY = 0, currentTransY = 0, isDraggingModal = false;
    document.addEventListener('touchstart', (e) => {
        if(!currentModal || window.innerWidth > 680) return;
        const scrollable = e.target.closest('.scrollable-content');
        const handle = e.target.closest('.modal-drag-area') || e.target.closest('.drag-target');
        if (handle) {
            isDraggingModal = true;
            modalStartY = e.touches[0].clientY;
            currentModal.style.transition = 'none';
        } else if (scrollable && scrollable.scrollTop <= 0) {
            isDraggingModal = true;
            modalStartY = e.touches[0].clientY;
            currentModal.style.transition = 'none';
        }
    }, {passive: true});
    
    document.addEventListener('touchmove', (e) => {
        if(!isDraggingModal) return;
        const deltaY = e.touches[0].clientY - modalStartY;
        if (deltaY > 0) {
            if (e.cancelable) e.preventDefault(); 
            currentTransY = deltaY;
            currentModal.style.transform = `translateY(${currentTransY}px)`;
        }
    }, {passive: false}); 
    
    document.addEventListener('touchend', () => {
        if(!isDraggingModal) return;
        isDraggingModal = false;
        currentModal.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        if(currentTransY > 100) closeModal();
        else currentModal.style.transform = `translateY(0)`;
        currentTransY = 0;
    });

    document.addEventListener('click', (e) => {
        const hTarget = e.target.closest('[data-h-target]');
        if (hTarget) {
            const targetId = hTarget.getAttribute('data-h-target');
            if (targetId === 'ios') {
                showToast('Перенаправляем в App Store...', 'apple', '#fff');
                setTimeout(() => window.open('https://apps.apple.com/us/app/hiddify-proxy-vpn/id6596777532', '_blank'), 1000);
            } else {
                document.querySelectorAll('.hiddify-view').forEach(v => v.classList.remove('active'));
                document.getElementById(targetId)?.classList.add('active');
            }
        }
        if (e.target.closest('.h-back')) {
            document.querySelectorAll('.hiddify-view').forEach(v => v.classList.remove('active'));
            document.getElementById('h-view-main').classList.add('active');
        }
    });

    // --- Котики ---
    const term = document.getElementById('cat-terminal');
    const catImg = document.getElementById('cat-img');
    const skeleton = document.getElementById('cat-skeleton');
    const waitingScreen = document.getElementById('cat-waiting');
    const errOverlay = document.getElementById('cat-error');
    const sourceBadge = document.getElementById('cat-source');
    const catActions = document.getElementById('cat-actions');
    const catSearchGroup = document.getElementById('cat-search-group');
    const catSearchInput = document.getElementById('cat-search');
    
    let currentCatController = null;
    window.currentCatUrl = null;

    document.querySelectorAll('input[name="cat-api"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const mode = e.target.value;
            if (mode === 'thecatapi' || mode === 'shibe') {
                catSearchGroup.style.display = 'none';
                catSearchInput.value = '';
            } else {
                catSearchGroup.style.display = 'flex';
            }
        });
    });

    function logTerm(msg, type = 'info') {
        term.style.color = type === 'error' ? '#ef4444' : type === 'warn' ? '#facc15' : '#10b981';
        term.innerText = `> ${msg}`;
    }

    async function translateTag(tag) {
        logTerm('Переводим запрос...', 'warn');
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(tag)}&langpair=ru|en`);
            const data = await res.json();
            let translated = data.responseData.translatedText.split(' ')[0].toLowerCase();
            return translated.replace(/[^a-zA-Z0-9]/g, '').trim(); 
        } catch { return tag.replace(/[^a-zA-Z0-9]/g, '').trim(); }
    }

    async function processCat() {
        if(currentCatController) currentCatController.abort();
        currentCatController = new AbortController();
        const signal = currentCatController.signal;

        catImg.style.display = 'none';
        errOverlay.style.display = 'none';
        sourceBadge.style.display = 'none';
        waitingScreen.style.display = 'none'; 
        catActions.style.display = 'none'; 
        skeleton.style.display = 'block';

        let tag = catSearchInput.value.trim();
        const mode = document.querySelector('input[name="cat-api"]:checked').value;

        if (tag && /[а-яА-ЯёЁ]/.test(tag)) tag = await translateTag(tag);

        let imageUrl = null;
        let usedApiName = '';

        try {
            if (tag && (mode === 'auto' || mode === 'cataas')) {
                logTerm(`Поиск по тегу "${tag}" через Cataas...`);
                const res = await fetch(`https://cataas.com/api/cats?tags=${tag}&limit=20`, { signal });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const randomCat = data[Math.floor(Math.random() * data.length)];
                        const id = randomCat._id || randomCat.id;
                        if (id) {
                            imageUrl = `https://cataas.com/cat/${id}`;
                            usedApiName = 'Cataas';
                        }
                    } else { throw new Error("По этому тегу ничего нет."); }
                } else { throw new Error("Cataas недоступен."); }
            } else {
                const APIS =[
                    { name: 'TheCatAPI', url: 'https://api.thecatapi.com/v1/images/search', extract: d => d[0]?.url },
                    { name: 'Shibe.online', url: 'https://shibe.online/api/cats', extract: d => d[0] },
                    { name: 'Cataas', url: 'https://cataas.com/api/cats?limit=20&skip=' + Math.floor(Math.random() * 500), extract: d => {
                        if (!d || d.length === 0) return null;
                        const cat = d[Math.floor(Math.random() * d.length)];
                        const id = cat._id || cat.id;
                        return id ? `https://cataas.com/cat/${id}` : null;
                    }}
                ];

                let targetApis = mode === 'auto' ? APIS : APIS.filter(a => a.name.toLowerCase().includes(mode));

                for (const api of targetApis) {
                    try {
                        logTerm(`Подключение к ${api.name}...`);
                        const res = await fetch(api.url, { signal });
                        if(!res.ok) throw new Error(`HTTP ${res.status}`);
                        const data = await res.json();
                        imageUrl = api.extract(data);
                        if(imageUrl) {
                            usedApiName = api.name;
                            break; 
                        }
                    } catch (e) {
                        if(e.name === 'AbortError') return;
                        logTerm(`${api.name} упал. Пробуем другой...`, 'warn');
                    }
                }
            }
        } catch (e) {
            if(e.name === 'AbortError') return;
            logTerm(`Ошибка: ${e.message}`, 'error');
        }

        if (!imageUrl) {
            logTerm('Котик не найден.', 'error');
            document.getElementById('cat-err-title').innerText = tag ? "Пусто 😿" : "API Упал 🤬";
            document.getElementById('cat-err-desc').innerText = tag ? "Котиков с таким тегом нет" : "Все сервера отказали в доступе";
            catImg.src = `https://http.cat/${tag ? 404 : 500}`;
            catImg.onload = () => { 
                skeleton.style.display = 'none'; 
                catImg.style.display = 'block'; 
                errOverlay.style.display = 'block'; 
                catActions.style.display = 'flex'; 
            };
            return;
        }

        logTerm(`Загрузка с ${usedApiName}...`);
        catImg.onload = () => {
            skeleton.style.display = 'none';
            catImg.style.display = 'block';
            sourceBadge.innerText = usedApiName;
            sourceBadge.style.display = 'block';
            catActions.style.display = 'flex'; 
            logTerm('Успешно загружено!');
        };
        catImg.onerror = () => {
            logTerm('Картинка недоступна.', 'error');
            skeleton.style.display = 'none';
            errOverlay.style.display = 'block';
            catActions.style.display = 'flex';
        };
        catImg.src = imageUrl;
        window.currentCatUrl = imageUrl;
    }

    document.getElementById('btn-wait-start').addEventListener('click', processCat);
    document.getElementById('btn-cat-search').addEventListener('click', processCat);
    catSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') processCat(); });
    document.getElementById('btn-cat-next').addEventListener('click', processCat);
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    catImg.addEventListener('click', () => {
        if(catImg.src && catImg.src.startsWith('http')) {
            lightboxImg.src = catImg.src;
            lightbox.style.display = 'flex';
            setTimeout(() => lightbox.classList.add('show'), 10);
        }
    });
    
    function closeLightbox() {
        lightbox.classList.remove('show');
        setTimeout(() => lightbox.style.display = 'none', 300);
    }
    
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });

    async function downloadBlobFromUrl(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Direct fetch failed');
            return await res.blob();
        } catch (e) {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const proxyRes = await fetch(proxyUrl);
            if (!proxyRes.ok) throw new Error('Proxy fetch failed');
            return await proxyRes.blob();
        }
    }

    document.getElementById('btn-cat-download').addEventListener('click', async () => {
        if(!window.currentCatUrl) return;
        const btn = document.getElementById('btn-cat-download');
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        try {
            const blob = await downloadBlobFromUrl(window.currentCatUrl);
            const a = document.createElement('a'); 
            a.href = URL.createObjectURL(blob); 
            a.download = `cat_${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            showToast('Котик скачан! 🐱');
        } catch(e) {
            window.open(window.currentCatUrl, '_blank');
            showToast('Открыто в новой вкладке', 'info', '#3b82f6');
        } finally { 
            btn.style.opacity = '1'; 
            btn.style.pointerEvents = 'auto';
        }
    });

    // --- SPOTIFY LANYARD API ---
    const DISCORD_ID = '835456105328410625';
    let spotifyInterval;

    function formatTime(ms) {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Универсальная функция обновления UI Spotify
    function updateSpotifyUI(s) {
        const widget = document.getElementById('spotify-widget');
        clearInterval(spotifyInterval);

        if (s) {
            widget.classList.add('playing'); widget.classList.remove('idle');
            widget.setAttribute('data-url', `https://open.spotify.com/track/${s.track_id}`);
            widget.style.setProperty('--bg-img', `url(${s.album_art_url})`);

            document.getElementById('sp-status-text').innerText = "Сейчас играет";
            document.getElementById('sp-song').innerText = s.song;
            
            // Заменяем точку с запятой на запятую и пробел
            const formattedArtist = s.artist.replace(/;/g, ', ');
            document.getElementById('sp-artist').innerText = formattedArtist;
            document.getElementById('sp-cover').style.backgroundImage = `url(${s.album_art_url})`;

            const start = s.timestamps.start;
            const end = s.timestamps.end;
            const pBar = document.getElementById('sp-progress');
            const tCurrent = document.getElementById('sp-time-current');
            
            document.getElementById('sp-time-end').innerText = formatTime(end - start);

            const updateProgress = () => {
                const now = Date.now();
                if(now >= end) {
                    pBar.style.width = '100%';
                    tCurrent.innerText = formatTime(end - start);
                    clearInterval(spotifyInterval);
                    return;
                }
                const progress = ((now - start) / (end - start)) * 100;
                pBar.style.width = progress + '%';
                tCurrent.innerText = formatTime(now - start);
            };
            updateProgress(); 
            spotifyInterval = setInterval(updateProgress, 1000); 
            
        } else {
            widget.classList.add('idle'); widget.classList.remove('playing');
            widget.removeAttribute('data-url');
            widget.style.removeProperty('--bg-img'); 
            document.getElementById('sp-status-text').innerText = "Музыка на паузе";
            document.getElementById('sp-song').innerText = "Сейчас я не слушаю Spotify";
            document.getElementById('sp-artist').innerText = "...";
            document.getElementById('sp-cover').style.backgroundImage = 'none';
            document.getElementById('sp-progress').style.width = '0%';
            document.getElementById('sp-time-current').innerText = "0:00";
            document.getElementById('sp-time-end').innerText = "0:00";
        }
    }

    // 1. Быстрый REST API запрос для моментального отображения статуса
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.listening_to_spotify) {
                updateSpotifyUI(data.data.spotify);
            }
        }).catch(err => console.log('REST Lanyard error:', err));

    // 2. WebSocket соединение для лайв-обновления треков
    function connectLanyard() {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        ws.onopen = () => ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
        ws.onmessage = (e) => {
            try {
                const { t, d } = JSON.parse(e.data);
                if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
                    const ud = (t === 'INIT_STATE' && d[DISCORD_ID]) ? d[DISCORD_ID] : d;
                    if (ud && ud.listening_to_spotify && ud.spotify) {
                        updateSpotifyUI(ud.spotify);
                    } else if (ud) {
                        updateSpotifyUI(null);
                    }
                }
            } catch(err) {}
        };
        ws.onclose = () => setTimeout(connectLanyard, 5000);
    }
    connectLanyard();
});