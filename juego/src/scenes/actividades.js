import { activities } from './activities.js';
import { preloadStars, addStarsBadge } from '../stars.js';

const introsVistas = new Set();

export class Actividades extends Phaser.Scene {

    constructor() {
        super('Actividades');
    }

    preload() {
        this.load.image('background', 'assets/Actividades/fondo1.png');
        this.load.image('casita', 'assets/Actividades/casita.png');
        this.load.image('Sopa', 'assets/Actividades/Sopa.png');
        this.load.image('Une', 'assets/Actividades/une.png')
        this.load.image('Arma', 'assets/Actividades/arma.png')
        this.load.image('pareja', 'assets/Actividades/pareja.png')
        this.load.image('abc', 'assets/Actividades/abc.png')
        this.load.image('completa', 'assets/Actividades/completa.png')
        this.load.image('memoria', 'assets/Actividades/memoria.png')
        this.load.image('Titulo_Act', 'assets/Actividades/actividades_T.png')
        preloadStars(this);
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.add.image(640, 360, 'background').setScale(0.16);
        this.add.image(640, 75, 'Titulo_Act').setScale(0.14)
        this.createActivityGrid();
        this.createBackButton();
    }

    createActivityGrid() {
        const cols = 3;
        const cellWidth = 360;
        const cellHeight = 180;
        const gap = 20;

        const rowGap = 46;
        const rowSpacing = cellHeight + rowGap;
        const colSpacing = cellWidth + gap;

        const gridWidth = cols * cellWidth + (cols - 1) * gap;
        const startX = 640 - gridWidth / 2 + cellWidth / 2;
        const startY = 250;

        activities.slice(0, 6).forEach((activity, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * colSpacing;
            const y = startY + row * rowSpacing;

            this.createActivityCard(x, y, cellWidth, cellHeight, activity);
        });
    }

    createActivityCard(x, y, w, h, activity) {
        const container = this.add.container(x, y);

        if (activity.cover) {

            const img = this.add.image(0, 0, activity.cover);
            const padding = 14;
            const maxW = w - padding * 2;
            const maxH = h - padding * 2;
            const scale = Math.min(maxW / img.width, maxH / img.height);
            img.setScale(scale);
            container.add(img);
        } else {
            const title = this.add.text(0, 0, activity.title, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: w - 40 }
            }).setOrigin(0.5);
            container.add(title);
        }

        addStarsBadge(this, container, h / 2 + 25, activity.id);

        const zone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
        container.add(zone);

        zone.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 120 });
        });

        zone.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 120 });
        });

        zone.on('pointerdown', () => {
            const targetSceneByType = {
                wordsearch: 'SopaDeLetras',
                completeword: 'CompletaPalabra',
                matchimage: 'UnePalabraImagen',
                sentencepuzzle: 'RompecabezasFrases',
                letterbubbles: 'BurbujasLetras',
                memory: 'Memorama'
            };

            const targetScene = targetSceneByType[activity.type];
            if (!targetScene) return;

            if (activity.video && !introsVistas.has(activity.id)) {
                introsVistas.add(activity.id);

                this.scene.start('Intros', { targetScene, activityId: activity.id });
            } else {

                this.scene.start(targetScene, { activityId: activity.id });
            }
        });
    }

    createBackButton() {
        const backBtn = this.add.image(80, 625, 'casita')
            .setDisplaySize(100, 100)
            .setInteractive({ useHandCursor: true });
        this.backButton = backBtn;
        const baseScale = backBtn.scaleX;

        backBtn.on('pointerover', () => {
            this.tweens.add({ targets: backBtn, scale: baseScale * 1.15, duration: 120 });
        });
        backBtn.on('pointerout', () => {
            this.tweens.add({ targets: backBtn, scale: baseScale, duration: 120 });
        });
        backBtn.on('pointerdown', () => this.scene.start('Menu'));
    }
}