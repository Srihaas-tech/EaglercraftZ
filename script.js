function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

function launchGame() {
    const versionSelect = document.getElementById('versionSelect');
    if (versionSelect && versionSelect.value) {
        window.location.href = versionSelect.value;
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
        // Adjust path if we're in the javascript/ or wasm/ folders
        const isSubfolder = window.location.pathname.includes('/javascript/') || window.location.pathname.includes('/wasm/');
        window.location.replace(isSubfolder ? '../assets/fakeBlock/blocked.html' : 'assets/fakeBlock/blocked.html');
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
            <option value="javascript/index.html">EaglercraftZ Javascript</option>
            <option value="wasm/index.html">EaglercraftZ Wasm</option>
        `;
    } else {
        versionSelect.innerHTML = '<option value="">(More coming soon)</option>';
    }
}