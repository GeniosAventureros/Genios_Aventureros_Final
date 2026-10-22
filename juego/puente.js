// Puente entre la página web (jugar.html) y el juego.
// Recibe mensajes { tipo: 'silencio', valor: true|false } y silencia TODO el audio:
// música/efectos de Phaser, videos de introducción y la voz narradora (speechSynthesis).
(function () {
    let silenciado = false;

    // La voz narradora: si está en silencio, no se pronuncia nada.
    if ('speechSynthesis' in window) {
        const hablar = window.speechSynthesis.speak.bind(window.speechSynthesis);
        window.speechSynthesis.speak = function (u) {
            if (silenciado) return;
            hablar(u);
        };
    }

    function aplicar() {
        const juego = window.__game;
        if (juego && juego.sound) juego.sound.mute = silenciado;
        document.querySelectorAll('video, audio').forEach(function (m) { m.muted = silenciado; });
        if (silenciado && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    window.addEventListener('message', function (e) {
        if (e.origin !== window.location.origin && window.location.origin !== 'null') return;
        const d = e.data || {};
        if (d.tipo === 'silencio') {
            silenciado = !!d.valor;
            aplicar();
        }
    });

    // Los videos se crean dentro del juego más tarde: reaplicar el silencio periódicamente.
    setInterval(function () { if (silenciado) aplicar(); }, 500);

    // Avisar a la página que el juego ya está listo para recibir el estado de silencio.
    window.addEventListener('load', function () {
        if (window.parent !== window) window.parent.postMessage({ tipo: 'juego-listo' }, '*');
    });
})();
