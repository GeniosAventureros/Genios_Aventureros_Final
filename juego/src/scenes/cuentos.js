import { stories } from './stories.js';
import { preloadStars, addStarsBadge } from '../stars.js';

export class Cuentos extends Phaser.Scene {

    constructor() {
        super('Cuentos');
    }

    preload() {
        this.load.image('background', 'assets/Cuentos/fondo1.png');
        this.load.image('casita', 'assets/Cuentos/casita.png');
        this.load.image('cerditos', 'assets/Cuentos/cerditos.png')
        this.load.image('patito', 'assets/Cuentos/patito.png')
        this.load.image('leon', 'assets/Cuentos/leon.png')
        this.load.image('caperucita', 'assets/Cuentos/caperucita.png')
        this.load.image('tortuga', 'assets/Cuentos/tortuga.png')
        this.load.image('ricitos', 'assets/Cuentos/ricitos.png')
        this.load.image('titulo_C', 'assets/Cuentos/cuentos_T.png')
                preloadStars(this);

            this.load.image('patito1', 'assets/Cuentos/Patito/patito1.png')
            this.load.image('patito2', 'assets/Cuentos/Patito/patito2.png')
            this.load.image('patito3', 'assets/Cuentos/Patito/patito3.png')
            this.load.image('patito4', 'assets/Cuentos/Patito/patito4.png')
            this.load.image('patito5', 'assets/Cuentos/Patito/patito5.png')
            this.load.image('patito6', 'assets/Cuentos/Patito/patito6.png')
            this.load.image('patito7', 'assets/Cuentos/Patito/patito7.png')

            this.load.image('caperucita1', 'assets/Cuentos/Caperucita/caperucita1.png')
            this.load.image('caperucita2', 'assets/Cuentos/Caperucita/caperucita2.png')
            this.load.image('caperucita3', 'assets/Cuentos/Caperucita/caperucita3.png')
            this.load.image('caperucita4', 'assets/Cuentos/Caperucita/caperucita4.png')
            this.load.image('caperucita5', 'assets/Cuentos/Caperucita/caperucita5.png')
            this.load.image('caperucita6', 'assets/Cuentos/Caperucita/caperucita6.png')
            this.load.image('caperucita7', 'assets/Cuentos/Caperucita/caperucita7.png')

            this.load.image('leon1', 'assets/Cuentos/Leon/leon1.png')
            this.load.image('leon2', 'assets/Cuentos/Leon/leon2.png')
            this.load.image('leon3', 'assets/Cuentos/Leon/leon3.png')
            this.load.image('leon4', 'assets/Cuentos/Leon/leon4.png')
            this.load.image('leon5', 'assets/Cuentos/Leon/leon5.png')
            this.load.image('leon6', 'assets/Cuentos/Leon/leon6.png')
            this.load.image('leon7', 'assets/Cuentos/Leon/leon7.png')

            this.load.image('cerditos1', 'assets/Cuentos/Cerditos/cerditos1.png')
            this.load.image('cerditos2', 'assets/Cuentos/Cerditos/cerditos2.png')
            this.load.image('cerditos3', 'assets/Cuentos/Cerditos/cerditos3.png')
            this.load.image('cerditos4', 'assets/Cuentos/Cerditos/cerditos4.png')
            this.load.image('cerditos5', 'assets/Cuentos/Cerditos/cerditos5.png')
            this.load.image('cerditos6', 'assets/Cuentos/Cerditos/cerditos6.png')
            this.load.image('cerditos7', 'assets/Cuentos/Cerditos/cerditos7.png')

            this.load.image('tortuga1', 'assets/Cuentos/Tortuga/tortuga1.png')
            this.load.image('tortuga2', 'assets/Cuentos/Tortuga/tortuga2.png')
            this.load.image('tortuga3', 'assets/Cuentos/Tortuga/tortuga3.png')
            this.load.image('tortuga4', 'assets/Cuentos/Tortuga/tortuga4.png')
            this.load.image('tortuga5', 'assets/Cuentos/Tortuga/tortuga5.png')
            this.load.image('tortuga6', 'assets/Cuentos/Tortuga/tortuga6.png')
            this.load.image('tortuga7', 'assets/Cuentos/Tortuga/tortuga7.png')

            this.load.image('ricitos1', 'assets/Cuentos/Ricitos/ricitos1.png')
            this.load.image('ricitos2', 'assets/Cuentos/Ricitos/ricitos2.png')
            this.load.image('ricitos3', 'assets/Cuentos/Ricitos/ricitos3.png')
            this.load.image('ricitos4', 'assets/Cuentos/Ricitos/ricitos4.png')
            this.load.image('ricitos5', 'assets/Cuentos/Ricitos/ricitos5.png')
            this.load.image('ricitos6', 'assets/Cuentos/Ricitos/ricitos6.png')
            this.load.image('ricitos7', 'assets/Cuentos/Ricitos/ricitos7.png')
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        this.add.image(640, 360, 'background').setScale(0.16);
        this.add.image(640, 75, 'titulo_C').setScale(0.14)

        this.createStoryGrid();
        this.createBackButton();
    }

    createStoryGrid() {
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

        stories.slice(0, 6).forEach((story, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + col * colSpacing;
            const y = startY + row * rowSpacing;

            this.createStoryCard(x, y, cellWidth, cellHeight, story);
        });
    }

    createStoryCard(x, y, w, h, story) {
        const container = this.add.container(x, y);

        const panel = this.add.graphics();
        panel.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
        panel.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
        container.add(panel);

        if (story.cover) {

            const img = this.add.image(0, 0, story.cover);
            const padding = 14;
            const maxW = w - padding * 2;
            const maxH = h - padding * 2;
            const scale = Math.min(maxW / img.width, maxH / img.height);
            img.setScale(scale);
            container.add(img);
        } else {
            const title = this.add.text(0, 0, story.title, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: w - 40 }
            }).setOrigin(0.5);
            container.add(title);
        }

        addStarsBadge(this, container, h / 2 + 25, 'story:' + story.id);

        const zone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
        container.add(zone);

        zone.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.2, duration: 120 });
        });

        zone.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 120 });
        });

        zone.on('pointerdown', () => {
            this.scene.start('CuentaCuentos', { storyId: story.id });
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