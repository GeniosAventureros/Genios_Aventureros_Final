import { COLORS, preloadUI, makeImage, makePanel, addButtonFx } from './ui.js';

const progress = {};

try { localStorage.removeItem('genios_estrellas'); } catch (e) {  }

export function preloadStars(scene) {
    preloadUI(scene, ['panel_puntos', 'estrella', 'estrella_vacia', 'btn_reintentar', 'btn_menu', 'btn_leer_otra', 'btn_cuentos', 'panel_final']);
}

export function starsFromAccuracy(good, bad) {
    const total = good + bad;
    const accuracy = total > 0 ? good / total : 1;
    if (accuracy >= 0.85) return 3;
    if (accuracy >= 0.6) return 2;
    return 1;
}

export function getBestStars(id) {
    const r = progress[id];
    return r ? r.stars : 0;
}

function saveResult(id, stars, score) {
    const prev = progress[id] || { stars: 0, score: 0 };
    const record = stars > prev.stars || (stars === prev.stars && score > prev.score);
    if (record) progress[id] = { stars, score };
    return { record, best: Math.max(stars, prev.stars) };
}

const starText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

export function addStarsBadge(scene, container, y, activityId, size = 24) {
    const best = getBestStars(activityId);
    const step = size + 10;

    container.add(makePanel(scene, 'panel_puntos', step * 3 + 14, size + 16, 0, y));
    for (let i = 0; i < 3; i++) {
        container.add(makeImage(scene, i < best ? 'estrella' : 'estrella_vacia', size, size, (i - 1) * step, y));
    }
}

function disableAll(list, keep) {
    list.forEach((obj) => {
        if (obj === keep) return;
        if (obj.input && obj.input.enabled) obj.disableInteractive();
        if (obj.list) disableAll(obj.list, keep);
    });
}

const MESSAGES = { 3: '¡Excelente!', 2: '¡Muy bien!', 1: '¡Buen intento!' };

export function showResults(scene, { stars, score, detail, id, retryImage, menuImage, onRetry, onMenu }) {
    if (scene.__resultsShown) return;
    scene.__resultsShown = true;

    scene.events.once('shutdown', () => { scene.__resultsShown = false; });
    stars = Math.max(1, Math.min(3, stars));

    const activityId = scene.activityId;
    const { record, best } = saveResult(id || activityId, stars, score || 0);

    disableAll(scene.children.list, scene.backButton);

    const layer = scene.add.container(0, 0).setDepth(1000).setAlpha(0);
    layer.add(scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5));
    layer.add(makePanel(scene, 'panel_final', 640, 450, 640, 350));

    const text = (x, y, str, size, color, bold = true) => {
        const t = scene.add.text(x, y, str, {
            fontFamily: 'Arial', fontSize: size + 'px', color, fontStyle: bold ? 'bold' : 'normal', align: 'center'
        }).setOrigin(0.5);
        layer.add(t);
        return t;
    };

    text(640, 180, MESSAGES[stars], 42, COLORS.purple);

    const starSize = 108;
    const xs = [-125, 0, 125];
    xs.forEach((dx) => layer.add(makeImage(scene, 'estrella_vacia', starSize, starSize, 640 + dx, 285)));
    for (let i = 0; i < stars; i++) {
        const img = makeImage(scene, 'estrella', starSize, starSize, 640 + xs[i], 285);
        const base = img.scaleX;
        img.setScale(0).setAngle(-25);
        layer.add(img);
        scene.tweens.add({
            targets: img, scale: base, angle: 0, duration: 450, delay: 450 + i * 350, ease: 'Back.easeOut'
        });
    }

    text(640, 375, `Puntos: ${score || 0}`, 28, COLORS.ink);
    if (detail) text(640, 410, detail, 20, '#555555', false);
    text(640, 447, record ? '¡Nuevo récord! 🏆' : `Tu mejor resultado: ${starText(best)}`, 20,
        record ? '#e8590c' : '#555555');

    const addButton = (x, name, onClick) => {
        const img = makeImage(scene, name, 230, 60, x, 515);
        const zone = scene.add.zone(x, 515, 230, 60).setInteractive({ useHandCursor: true });
        layer.add([img, zone]);
        addButtonFx(scene, img, zone);
        zone.on('pointerdown', onClick);
    };
    const stopVoice = () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
    addButton(515, retryImage || 'btn_reintentar', () => {
        stopVoice();
        if (onRetry) onRetry(); else scene.scene.start(scene.scene.key, { activityId });
    });
    addButton(765, menuImage || 'btn_menu', () => {
        stopVoice();
        if (onMenu) onMenu(); else scene.scene.start('Actividades');
    });

    scene.tweens.add({ targets: layer, alpha: 1, duration: 300 });
}
