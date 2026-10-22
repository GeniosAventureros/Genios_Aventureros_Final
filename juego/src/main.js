import { Start } from './scenes/start.js';
import { Menu } from './scenes/Menu.js';
import { Cuentos } from './scenes/cuentos.js';
import { CuentaCuentos } from './scenes/CuentaCuentos.js';
import { Actividades } from './scenes/actividades.js';
import { SopaDeLetras } from './scenes/sopa.js';
import { CompletaPalabra } from './scenes/completa.js';
import { UnePalabraImagen } from './scenes/unePalabra.js';
import { RompecabezasFrases } from './scenes/RompecabezasFrases.js';
import { BurbujasLetras } from './scenes/burbujas.js';
import { Memorama } from './scenes/memorama.js';
import { Intros } from './scenes/Intros.js';
import { Preguntas } from './scenes/Preguntas.js';
import { initGamepad } from './gamepad.js';

const DESIGN_W = 1280;
const DESIGN_H = 720;
const RES = 1920 / DESIGN_W;

const sceneClasses = [Start, Menu, Cuentos, CuentaCuentos, Actividades, Intros,
    SopaDeLetras, CompletaPalabra, UnePalabraImagen, RompecabezasFrases,
    BurbujasLetras, Memorama, Preguntas];

function showLoader(scene) {
    if (!scene.load || scene.load.list.size === 0) return;
    const cam = scene.cameras.main;
    cam.setZoom(1);
    cam.setScroll(0, 0);

    const w = 640, h = 28;
    const cx = 960, cy = 540;
    const back = scene.add.graphics();
    back.fillStyle(0x040218, 1).fillRect(0, 0, 1920, 1080);
    back.fillStyle(0xffffff, 0.15).fillRoundedRect(cx - w / 2, cy, w, h, 14);
    const bar = scene.add.graphics();
    const label = scene.add.text(cx, cy - 50, 'Cargando...', {
        fontFamily: 'Arial',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffffff'
    }).setOrigin(0.5);
    const percent = scene.add.text(cx, cy + h + 40, '0%', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#FDB813'
    }).setOrigin(0.5);
    [back, bar, label, percent].forEach((o) => o.setDepth(10000));

    scene.load.on('progress', (value) => {
        bar.clear();
        bar.fillStyle(0xfdb813, 1).fillRoundedRect(cx - w / 2, cy, Math.max(h, w * value), h, 14);
        percent.setText(Math.round(value * 100) + '%');
    });
    scene.load.once('complete', () => {
        [back, bar, label, percent].forEach((o) => o.destroy());
    });
}

sceneClasses.forEach((SceneClass) => {
    const originalPreload = SceneClass.prototype.preload;
    if (!originalPreload) return;
    SceneClass.prototype.preload = function (...args) {
        const result = originalPreload.apply(this, args);
        showLoader(this);
        return result;
    };
});

sceneClasses.forEach((SceneClass) => {
    const originalCreate = SceneClass.prototype.create;
    SceneClass.prototype.create = function (...args) {
        const cam = this.cameras.main;
        cam.setZoom(RES);
        cam.centerOn(DESIGN_W / 2, DESIGN_H / 2);
        if (originalCreate) return originalCreate.apply(this, args);
    };
});

['text'].forEach((name) => {
    const factory = Phaser.GameObjects.GameObjectFactory.prototype;
    const original = factory[name];
    factory[name] = function (...args) {
        return original.apply(this, args).setResolution(RES);
    };
});
const creator = Phaser.GameObjects.GameObjectCreator.prototype;
const originalMakeText = creator.text;
creator.text = function (...args) {
    return originalMakeText.apply(this, args).setResolution(RES);
};

const config = {
    type: Phaser.AUTO,
    title: 'Genius',
    parent: 'game-container',
    width: 1920,
    height: 1080,
    backgroundColor: '#000000',
    pixelArt: false,
    render: {
        antialias: true,
        mipmapFilter: 'LINEAR_MIPMAP_LINEAR'
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    scene: [
        Start,
        Menu,
        Cuentos,
        CuentaCuentos,
        Actividades,
        Intros,
        SopaDeLetras,
        CompletaPalabra,
        UnePalabraImagen,
        RompecabezasFrases,
        BurbujasLetras,
        Memorama,
        Preguntas,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
};

const game = new Phaser.Game(config);

initGamepad(game);