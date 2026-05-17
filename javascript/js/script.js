const dropdown = document.getElementById('gameSelect');

function play() {
    const selectedPath = dropdown.value;
    if (selectedPath) {
        const newUrl = `${window.location.origin}${window.location.pathname}/${selectedPath}`;
        window.location.href = newUrl;
    }
}
