const S = 2;

export const COLORS = {
    purple: '#512BD4',
    purpleDark: '#2b1a8f',
    yellow: '#FDB813',
    cream: '#FFF8E7',
    green: '#4CAF50',
    red: '#EF476F',
    ink: '#2b2b45',
};

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function card(ctx, w, h, o) {
    const lw = (o.border || 3) * S;
    const r = (o.radius || 16) * S;
    const m = lw / 2 + 1;
    roundRect(ctx, m, m, w - 2 * m, h - 2 * m, r);
    if (o.fillTop) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, o.fillTop);
        g.addColorStop(1, o.fillBottom || o.fillTop);
        ctx.fillStyle = g;
    } else {
        ctx.fillStyle = o.fill;
    }
    ctx.fill();
    if (o.shine) {
        ctx.save();
        roundRect(ctx, m, m, w - 2 * m, h - 2 * m, r);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(0, 0, w, h * 0.45);
        ctx.restore();
    }
    ctx.lineWidth = lw;
    ctx.strokeStyle = o.stroke;
    if (o.dash) ctx.setLineDash([lw * 2.2, lw * 1.6]);
    roundRect(ctx, m, m, w - 2 * m, h - 2 * m, r);
    ctx.stroke();
    ctx.setLineDash([]);
}

function label(ctx, w, h, text, size, color) {
    ctx.fillStyle = color;
    ctx.font = `bold ${size * S}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + size * S * 0.04);
}

function star(ctx, w, h, o) {
    const cx = w / 2, cy = h / 2 + h * 0.04, R = w * 0.46, r = R * 0.48;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const ang = -Math.PI / 2 + (i * Math.PI) / 5;
        const rad = i % 2 === 0 ? R : r;
        ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad);
    }
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, o.fillTop);
    g.addColorStop(1, o.fillBottom);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5 * S;
    ctx.strokeStyle = o.stroke;
    ctx.stroke();
}

const PURPLE_CARD = { fillTop: '#7a55f0', fillBottom: '#512BD4', stroke: '#FDB813', border: 4, shine: true };
const PURPLE_PANEL = { fillTop: '#5b36db', fillBottom: '#3d1fa8', stroke: '#ffffff', border: 3, radius: 16, shine: true };

export const UI = {

    carta_reverso: {
        type: 'image', w: 130, h: 100,
        paint: (c, w, h) => { card(c, w, h, { ...PURPLE_CARD, radius: 20 }); label(c, w, h, '?', 52, '#ffffff'); },
    },
    carta_frente: {
        type: 'image', w: 130, h: 100,
        paint: (c, w, h) => card(c, w, h, { fillTop: '#ffffff', fillBottom: '#FFF1C9', stroke: '#512BD4', border: 4, radius: 20 }),
    },

    casilla: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, { fill: 'rgba(255,255,255,0.78)', stroke: '#512BD4', dash: true, border: 3 }),
    },
    casilla_error: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, { fill: 'rgba(255,224,230,0.92)', stroke: '#EF476F', border: 3 }),
    },
    ficha: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, PURPLE_PANEL),
    },
    ficha_sel: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, { fillTop: '#6a45ea', fillBottom: '#4a27c4', stroke: '#FDB813', border: 5, radius: 16, shine: true }),
    },
    ficha_ok: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, { fillTop: '#6fd573', fillBottom: '#3c9a40', stroke: '#ffffff', border: 3, radius: 16, shine: true }),
    },

    casilla_letra: {
        type: 'image', w: 60, h: 60,
        paint: (c, w, h) => card(c, w, h, { fillTop: '#ffffff', fillBottom: '#f0ecff', stroke: '#9d86ee', border: 3, radius: 14 }),
    },
    casilla_letra_ok: {
        type: 'image', w: 60, h: 60,
        paint: (c, w, h) => card(c, w, h, { fillTop: '#f2fff2', fillBottom: '#cdeccf', stroke: '#4CAF50', border: 3, radius: 14 }),
    },
    boton_letra: {
        type: 'image', w: 66, h: 66,
        paint: (c, w, h) => card(c, w, h, { ...PURPLE_PANEL, radius: 16 }),
    },

    btn_verificar: {
        type: 'image', w: 220, h: 60,
        paint: (c, w, h) => { card(c, w, h, { fillTop: '#ffd04d', fillBottom: '#f59f00', stroke: '#ffffff', border: 3, radius: 28, shine: true }); label(c, w, h, 'Verificar', 26, '#2b2b45'); },
    },
    btn_escuchar: {
        type: 'image', w: 200, h: 60,
        paint: (c, w, h) => { card(c, w, h, { fillTop: '#ffd04d', fillBottom: '#f59f00', stroke: '#ffffff', border: 3, radius: 28, shine: true }); label(c, w, h, 'Escuchar', 26, '#2b2b45'); },
    },

    estrella: {
        type: 'image', w: 96, h: 96,
        paint: (c, w, h) => star(c, w, h, { fillTop: '#ffe066', fillBottom: '#f59f00', stroke: '#ffffff' }),
    },
    estrella_vacia: {
        type: 'image', w: 96, h: 96,
        paint: (c, w, h) => star(c, w, h, { fillTop: '#e4e0f0', fillBottom: '#c9c3de', stroke: '#ffffff' }),
    },
    btn_reintentar: {
        type: 'image', w: 230, h: 60,
        paint: (c, w, h) => { card(c, w, h, { fillTop: '#ffd04d', fillBottom: '#f59f00', stroke: '#ffffff', border: 3, radius: 28, shine: true }); label(c, w, h, 'Jugar otra vez', 24, '#2b2b45'); },
    },
    btn_menu: {
        type: 'image', w: 230, h: 60,
        paint: (c, w, h) => { card(c, w, h, { fillTop: '#7a55f0', fillBottom: '#512BD4', stroke: '#ffffff', border: 3, radius: 28, shine: true }); label(c, w, h, 'Actividades', 24, '#ffffff'); },
    },

    btn_leer_otra: {
        type: 'image', w: 230, h: 60,
        paint: (c, w, h) => { card(c, w, h, { fillTop: '#ffd04d', fillBottom: '#f59f00', stroke: '#ffffff', border: 3, radius: 28, shine: true }); label(c, w, h, 'Leer otra vez', 24, '#2b2b45'); },
    },
    btn_cuentos: {
        type: 'image', w: 230, h: 60,
        paint: (c, w, h) => { card(c, w, h, { fillTop: '#7a55f0', fillBottom: '#512BD4', stroke: '#ffffff', border: 3, radius: 28, shine: true }); label(c, w, h, 'Cuentos', 24, '#ffffff'); },
    },
    btn_terminar_lectura: {
        type: 'image', w: 300, h: 60,
        paint: (c, w, h) => { card(c, w, h, { fillTop: '#6fd573', fillBottom: '#3c9a40', stroke: '#ffffff', border: 3, radius: 28, shine: true }); label(c, w, h, '¡Terminé de leer!', 26, '#ffffff'); },
    },

    panel_puntos: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, PURPLE_PANEL),
    },
    panel_parejas: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, PURPLE_PANEL),
    },
    panel_final: {
        type: 'panel', w: 128, h: 96, slice: 40,
        paint: (c, w, h) => card(c, w, h, { fillTop: '#ffffff', fillBottom: '#FFF1C9', stroke: '#512BD4', border: 5, radius: 20, shine: false }),
    },
};

Object.keys(UI).forEach((name) => {
    UI[name].file = `assets/UI/${name}.png`;
    UI[name].texScale = UI[name].texScale || S;
});

const key = (name) => 'ui_' + name;

const failed = new Set();

function trackFailures(scene) {
    if (scene.__uiTracking) return;
    scene.__uiTracking = true;
    scene.load.on('loaderror', (file) => failed.add(file.key));
}

export function preloadUI(scene, names) {
    trackFailures(scene);
    (names || Object.keys(UI)).forEach((name) => {
        if (failed.has(key(name)) || scene.textures.exists(key(name))) return;
        scene.load.image(key(name), UI[name].file);
    });
}

function ensure(scene, name) {
    const k = key(name);
    if (scene.textures.exists(k)) return k;
    const d = UI[name];
    const w = d.w * S, h = d.h * S;
    const tex = scene.textures.createCanvas(k, w, h);
    d.paint(tex.getContext(), w, h);
    tex.refresh();
    return k;
}

export function makeImage(scene, name, w, h, x = 0, y = 0) {
    return scene.add.image(x, y, ensure(scene, name)).setDisplaySize(w, h);
}

export function makePanel(scene, name, w, h, x = 0, y = 0) {
    const d = UI[name];
    const ts = d.texScale;
    const s = d.slice;
    const panel = scene.add.nineslice(x, y, ensure(scene, name), undefined, w * ts, h * ts, s, s, s, s);
    panel.setScale(1 / ts);
    return panel;
}

export function setPanel(scene, holder, name, w, h) {
    holder.removeAll(true);
    holder.add(makePanel(scene, name, w, h));
}

export function swapImage(scene, image, name, w, h) {
    image.setTexture(ensure(scene, name));
    image.setDisplaySize(w, h);
}

export function addButtonFx(scene, target, zone) {
    const base = target.scaleX;
    const hit = zone || target;
    hit.on('pointerover', () => scene.tweens.add({ targets: target, scale: base * 1.06, duration: 110, ease: 'Sine.easeOut' }));
    hit.on('pointerout', () => scene.tweens.add({ targets: target, scale: base, duration: 110, ease: 'Sine.easeOut' }));
    hit.on('pointerdown', () => scene.tweens.add({ targets: target, scale: base * 0.94, duration: 70, yoyo: true, ease: 'Sine.easeInOut' }));
}

export const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const letterFile = (l) => (l === 'Ñ' || l === 'ñ' ? 'enie' : l);

export function letterKey(kind, letter) {
    return `letra_${kind}_${letter}`;
}

export function preloadLetters(scene, letters) {
    trackFailures(scene);
    letters.forEach((l) => {
        const may = letterKey('may', l);
        const min = letterKey('min', l);
        if (!failed.has(may) && !scene.textures.exists(may)) scene.load.image(may, `assets/Letras/mayus/${letterFile(l)}.png`);
        if (!failed.has(min) && !scene.textures.exists(min)) scene.load.image(min, `assets/Letras/minus/${letterFile(l)}.png`);
    });
}
