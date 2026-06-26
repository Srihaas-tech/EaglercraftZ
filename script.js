const SERVER_PRESET_KEY = 'eaglerServerPreset';
const CUSTOM_SERVER_KEY = 'eaglerCustomServer';

function getServerConfig() {
    return window.EaglercraftZServerConfig || null;
}

function getFallbackServers() {
    return [
        { id: 'local', name: 'Local test server', addr: 'ws://localhost:8081/' },
        { id: 'archmc', name: 'ArchMC', addr: 'wss://mc.arch.lol/' },
        { id: 'thanatos', name: 'Thanatos Network', addr: 'wss://web.thanatos-network.xyz/' },
        { id: 'clever', name: 'Clever Teaching', addr: 'wss://clever-teaching.com/' },
        { id: 'hamburber', name: 'HAMBURBER-SMP', addr: 'wss://hamburber-smp.eagler.host/' }
    ];
}

function getLauncherServers() {
    const serverConfig = getServerConfig();
    return serverConfig ? serverConfig.getServers({ includeLocal: true }) : getFallbackServers();
}

function normalizeServerAddress(address) {
    const serverConfig = getServerConfig();
    if (serverConfig) {
        return serverConfig.normalizeServerAddress(address);
    }

    const trimmed = (address || '').trim();
    if (!trimmed) return '';
    if (/^wss?:\/\//i.test(trimmed)) return trimmed;
    if (/^https:\/\//i.test(trimmed)) return 'wss://' + trimmed.slice('https://'.length);
    if (/^http:\/\//i.test(trimmed)) return 'ws://' + trimmed.slice('http://'.length);
    return 'wss://' + trimmed;
}

function findServerPreset(serverId) {
    return getLauncherServers().find(server => server.id === serverId) || null;
}

function setSelectValueIfAvailable(select, value) {
    if (!select) return;
    const hasValue = Array.from(select.options).some(option => option.value === value);
    select.value = hasValue ? value : '';
}

function populateServerSelect() {
    const serverSelect = document.getElementById('serverSelect');
    if (!serverSelect) return;

    const storedValue = localStorage.getItem(SERVER_PRESET_KEY) || serverSelect.value;
    serverSelect.innerHTML = '';

    const serverListOption = document.createElement('option');
    serverListOption.value = '';
    serverListOption.textContent = 'Server List';
    serverSelect.appendChild(serverListOption);

    getLauncherServers().forEach(server => {
        const option = document.createElement('option');
        option.value = server.id;
        option.textContent = server.name;
        serverSelect.appendChild(option);
    });

    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom server';
    serverSelect.appendChild(customOption);

    setSelectValueIfAvailable(serverSelect, storedValue);
}

function handleServerSelectChange(options) {
    const serverSelect = document.getElementById('serverSelect');
    const customServerInput = document.getElementById('customServerInput');
    if (!serverSelect) return;

    const isCustom = serverSelect.value === 'custom';
    if (customServerInput) {
        customServerInput.classList.toggle('hidden', !isCustom);
        if (isCustom && (!options || options.focusCustom !== false)) customServerInput.focus();
    }

    localStorage.setItem(SERVER_PRESET_KEY, serverSelect.value);
}

function getSelectedServerAddress() {
    const serverSelect = document.getElementById('serverSelect');
    if (!serverSelect || !serverSelect.value) return '';

    if (serverSelect.value === 'custom') {
        const customServerInput = document.getElementById('customServerInput');
        return normalizeServerAddress(customServerInput ? customServerInput.value : '');
    }

    const server = findServerPreset(serverSelect.value);
    return server ? normalizeServerAddress(server.addr) : '';
}

function appendSelectedServer(url) {
    const server = getSelectedServerAddress();
    if (!server) return url;

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}server=${encodeURIComponent(server)}`;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

function launchGame() {
    const versionSelect = document.getElementById('versionSelect');
    if (versionSelect && versionSelect.value) {
        if (versionSelect.value === 'javascript') {
            showScreen('javascript-screen');
        } else if (versionSelect.value === 'wasm') {
            showScreen('wasm-screen');
        }
    }
}

function launchGameWithSettings(selectId) {
    const buildSelect = document.getElementById(selectId);
    if (buildSelect && buildSelect.value) {
        const url = appendSelectedServer(buildSelect.value);
        const toggle = document.getElementById('aboutBlankToggle');
        const useAboutBlank = toggle ? toggle.checked : localStorage.getItem('eaglerCloak') === 'true';

        if (useAboutBlank) {
            const win = window.open('about:blank', '_blank');
            if (win) {
                win.document.body.style.margin = '0';
                win.document.body.style.height = '100vh';
                win.document.body.style.overflow = 'hidden';
                const iframe = win.document.createElement('iframe');
                iframe.style.border = 'none';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.margin = '0';
                iframe.src = new URL(url, window.location.href).href;
                win.document.body.appendChild(iframe);
                
                // Pause launcher music
                const audio = document.getElementById('bg-music');
                if (audio) audio.pause();
            } else {
                alert('Popup blocker prevented opening the game in a new tab.');
                window.location.href = url; // fallback
            }
        } else {
            window.location.href = url;
        }
    }
}

function closeNotice() {
    const modal = document.getElementById('notice-modal');
    if (modal) modal.style.display = 'none';
    
    // Play audio after user interaction
    const audio = document.getElementById('bg-music');
    if (audio) {
        audio.play().catch(err => {
            console.log('Background music play prevented by browser, requires more interaction.');
        });
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'z') {
        window.location.replace('assets/fakeBlock/blocked.html');
    }
    
    if (event.key === 'Escape') {
        // If notice is hidden, escape goes back to main menu
        const modal = document.getElementById('notice-modal');
        if (!modal || modal.style.display === 'none') {
            showScreen('main-menu');
        }
    }
});

const liquidToggle = document.getElementById('liquidToggle');
if (liquidToggle) {
    liquidToggle.addEventListener('change', function(e) {
        const bg = document.getElementById('background-container') || document.querySelector('.bg-video');
        if(bg) {
            if(e.target.checked) {
                bg.style.filter = "brightness(0.7) hue-rotate(90deg) blur(3px) contrast(1.2)";
            } else {
                bg.style.filter = "brightness(0.7)";
            }
        }
    });
}


function updateRuntimes() {
    const clientSelect = document.getElementById('clientSelect');
    const clientStr = clientSelect ? clientSelect.value : null;
    const versionSelect = document.getElementById('versionSelect');
    
    if (!versionSelect) return;
    versionSelect.innerHTML = '';
    
    if (clientStr === 'eaglercraftz') {
        versionSelect.innerHTML = `
            <option value="javascript">EaglercraftZ Javascript</option>
            <option value="wasm">EaglercraftZ Wasm</option>
        `;
    } else {
        versionSelect.innerHTML = '<option value="">(More coming soon)</option>';
    }
}

// Intro Animation Logic & Setup
document.addEventListener('DOMContentLoaded', () => {
    populateServerSelect();

    const serverSelect = document.getElementById('serverSelect');
    const customServerInput = document.getElementById('customServerInput');
    if (customServerInput) {
        customServerInput.value = localStorage.getItem(CUSTOM_SERVER_KEY) || '';
        customServerInput.addEventListener('input', (e) => {
            localStorage.setItem(CUSTOM_SERVER_KEY, e.target.value);
        });
    }
    if (serverSelect) {
        handleServerSelectChange({ focusCustom: false });
    }

    // Setup Cloak Toggle
    const cloakToggle = document.getElementById('aboutBlankToggle');
    if (cloakToggle) {
        cloakToggle.checked = localStorage.getItem('eaglerCloak') === 'true';
        cloakToggle.addEventListener('change', (e) => {
            localStorage.setItem('eaglerCloak', e.target.checked);
        });
    }

    // Playlist Logic
    const playlist = [
        'assets/music/moog_city_2.ogg'
        // -- Add more track paths here --
    ];
    let currentSongIndex = 0;
    
    const audio = document.getElementById('bg-music');
    if (audio) {
        audio.addEventListener('ended', () => {
            if (playlist.length > 1) {
                let nextSongIndex;
                do {
                    nextSongIndex = Math.floor(Math.random() * playlist.length);
                } while (nextSongIndex === currentSongIndex);
                currentSongIndex = nextSongIndex;
            }
            audio.src = playlist[currentSongIndex];
            audio.play().catch(console.error);
        });
    }

    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
        setTimeout(() => {
            introScreen.style.opacity = '0';
            introScreen.style.visibility = 'hidden';
            introScreen.style.pointerEvents = 'none';
            introScreen.style.display = 'none';
        }, 3000);
    }
});
