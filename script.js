document.addEventListener('DOMContentLoaded', () => {
    
    // --- НАВИГАЦИЯ ---
    const navContainer = document.querySelector('.nav-container');
    const indicator = document.getElementById('nav-indicator');
    const btns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.tab-content');

    function moveIndicator(el) {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Учитываем скролл контейнера
        const containerRect = navContainer.getBoundingClientRect();
        const scrollLeft = navContainer.scrollLeft;
        
        indicator.style.width = `${rect.width}px`;
        // Корректный расчет позиции с учетом скролла
        indicator.style.left = `${(rect.left - containerRect.left) + scrollLeft}px`;
    }

    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Плавный скролл к кнопке если она за краем (на мобиле)
            e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            
            // Небольшая задержка чтобы скролл успел пройти перед перемещением индикатора
            setTimeout(() => moveIndicator(e.target), 100);

            const tabId = e.target.getAttribute('data-tab');
            sections.forEach(sec => sec.classList.remove('active'));
            const target = document.getElementById(tabId);
            if(target) target.classList.add('active');
            
            if(tabId === 'cats' && !currentCatBlobUrl) loadCat();
        });
    });

    // Инициализация индикатора
    const activeBtn = document.querySelector('.nav-btn.active');
    if(activeBtn) {
        // Ждем отрисовки шрифтов
        setTimeout(() => moveIndicator(activeBtn), 300);
    }
    
    // Пересчет при ресайзе и скролле меню
    window.addEventListener('resize', () => {
        const current = document.querySelector('.nav-btn.active');
        if(current) moveIndicator(current);
    });
    navContainer.addEventListener('scroll', () => {
        const current = document.querySelector('.nav-btn.active');
        // Обновляем позицию индикатора в реальном времени при скролле
        if(current) {
             const rect = current.getBoundingClientRect();
             const containerRect = navContainer.getBoundingClientRect();
             indicator.style.left = `${(rect.left - containerRect.left) + navContainer.scrollLeft}px`;
        }
    });

    // --- ДАТЫ ---
    function formatRelativeDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Сегодня';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}.${date.getFullYear()}`;
    }
    document.querySelectorAll('.soft-date').forEach(el => {
        const rawDate = el.getAttribute('data-date');
        if (rawDate) el.innerText = formatRelativeDate(rawDate);
    });

    // --- МОДАЛЬНЫЕ ОКНА ---
    window.openModal = function(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        document.querySelectorAll('.modal-window').forEach(m => {
            m.style.display = 'none'; m.classList.remove('show');
        });
        if (overlay && modal) {
            overlay.classList.add('active');
            modal.style.display = 'block';
            requestAnimationFrame(() => modal.classList.add('show'));
            document.body.style.overflow = 'hidden';
        }
    };
    window.closeModal = function(e) {
        if (e.target.id === 'modal-overlay') {
            const overlay = document.getElementById('modal-overlay');
            const modals = document.querySelectorAll('.modal-window');
            modals.forEach(m => m.classList.remove('show'));
            overlay.classList.remove('active');
            setTimeout(() => {
                modals.forEach(m => m.style.display = 'none');
                document.body.style.overflow = '';
            }, 350);
        }
    };

    // --- COPY & TOAST ---
    const toast = document.getElementById('toast');
    let toastTimer;
    window.copyText = function(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(showToast).catch(console.error);
        } else {
            const ta = document.createElement("textarea");
            ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
            document.body.appendChild(ta); ta.focus(); ta.select();
            try { document.execCommand('copy'); showToast(); } catch (e) {}
            document.body.removeChild(ta);
        }
    };
    function showToast() {
        if (!toast) return;
        toast.classList.add('active');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('active'), 2500);
    }

    // --- SPOTIFY ---
    const DISCORD_ID = '835456105328410625';
    const widget = document.getElementById('spotify-widget');
    const elCover = document.getElementById('sp-cover');
    const elSong = document.getElementById('sp-song');
    const elArtist = document.getElementById('sp-artist');
    const elProgress = document.getElementById('sp-progress');
    const elStatus = document.getElementById('sp-status-text');

    async function updateSpotify() {
        try {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
            const json = await res.json();
            const data = json.data;
            if (data && data.listening_to_spotify) {
                const s = data.spotify;
                widget.classList.add('playing');
                widget.onclick = function() { window.open(`https://open.spotify.com/track/${s.track_id}`, '_blank'); };
                elStatus.innerText = "Сейчас играет";
                elSong.innerText = s.song;
                elArtist.innerText = s.artist.replaceAll(';', ',');
                elCover.style.backgroundImage = `url(${s.album_art_url})`;
                const total = s.timestamps.end - s.timestamps.start;
                const current = Date.now() - s.timestamps.start;
                const percent = (current / total) * 100;
                elProgress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            } else {
                widget.classList.remove('playing');
                widget.onclick = null;
                elStatus.innerText = "Spotify Offline";
                elSong.innerText = "Музыка не играет";
                elArtist.innerText = "Сплю...";
                elCover.style.backgroundImage = 'none';
                elCover.style.backgroundColor = '#222';
                elProgress.style.width = '0%';
            }
        } catch (e) { console.error(e); }
    }
    setInterval(updateSpotify, 1000);
    updateSpotify();

    // --- CAT SYSTEM ---
    let currentCatController = null;
    let currentCatBlobUrl = null;
    window.loadCat = async function(retryCount = 0) {
        const img = document.getElementById('cat-img');
        const loader = document.getElementById('cat-loader');
        const progressBar = document.getElementById('cat-progress');
        const tag = document.getElementById('cat-tag').value;

        if (currentCatController) currentCatController.abort();
        currentCatController = new AbortController();

        img.style.display = 'none'; loader.style.display = 'flex'; progressBar.style.width = '0%';
        
        const timestamp = new Date().getTime();
        const fetchUrl = `https://cataas.com/cat${tag ? '/'+tag : ''}?width=800&height=600&t=${timestamp}`;

        try {
            const response = await fetch(fetchUrl, { signal: currentCatController.signal });
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            
            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length');
            let receivedLength = 0;
            let chunks = [];
            
            while(true) {
                const {done, value} = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;
                if (contentLength) {
                    progressBar.style.width = `${(receivedLength / contentLength) * 100}%`;
                } else {
                    progressBar.style.width = `${Math.min(90, (receivedLength / 2000000) * 100)}%`;
                }
            }
            
            progressBar.style.width = '100%';
            await new Promise(r => setTimeout(r, 200));

            const blob = new Blob(chunks);
            if (currentCatBlobUrl) URL.revokeObjectURL(currentCatBlobUrl);
            currentCatBlobUrl = URL.createObjectURL(blob);
            
            img.src = currentCatBlobUrl;
            img.onload = () => {
                loader.style.display = 'none';
                img.style.display = 'block';
                img.style.animation = 'fadeUp 0.5s ease-out';
            };
        } catch (error) {
            if (error.name !== 'AbortError' && retryCount < 3) {
                progressBar.style.width = '0%';
                setTimeout(() => window.loadCat(retryCount + 1), 1000);
            }
        }
    };

    window.downloadCat = function() {
        if(!currentCatBlobUrl) return;
        const link = document.createElement('a');
        link.href = currentCatBlobUrl;
        link.download = `cat_${Date.now()}.jpg`; 
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };
});