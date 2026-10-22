import { activities } from './activities.js';
import { preloadStars, showResults } from '../stars.js';
import { COLORS, ALPHABET, preloadUI, preloadLetters, letterKey, makeImage, makePanel } from '../ui.js';

const MEMORY_CONFIG = {
    pairsPerGame: 16,
    cols: 8,
    rows: 4,
    cellWidth: 130,
    cellHeight: 100,
    gap: 12,
    flipDelayMs: 650,
    matchScore: 100,
    mismatchPenalty: 10,
};

export class Memorama extends Phaser.Scene {

    constructor() {
        super('Memorama');
    }

    init(data) {
        this.activityId = data ? data.activityId : null;
        this.score = 0;
        this.attempts = 0;
        this.matchedPairs = 0;
        this.firstCard = null;
        this.secondCard = null;
        this.busy = false;

        this.letters = Phaser.Utils.Array.Shuffle([...ALPHABET]).slice(0, MEMORY_CONFIG.pairsPerGame);
    }

    preload() {
        this.load.image('background', 'assets/Pareja/fondo1.png');
        this.load.image('control', 'assets/Pareja/control.png');
        this.load.image('puntos', 'assets/Pareja/puntos.png')
        this.load.image('pareja_T', 'assets/Pareja/pareja_T.png');
        preloadUI(this, ['carta_reverso', 'carta_frente', 'panel_parejas', 'panel_final']);
        preloadLetters(this, this.letters);
        preloadStars(this);
    }

    create() {
        this.activity = activities.find(a => a.id === this.activityId);
        this.totalPairs = this.letters.length;

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.add.image(640, 360, 'background').setScale(0.16);
        this.add.image(640, 75, 'pareja_T').setScale(0.10);
        makePanel(this, 'panel_parejas', 190, 78, 140, 56);
        this.add.text(140, 38, 'Parejas', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#e6dcff'
        }).setOrigin(0.5);
        this.add.image(1150, 40, 'puntos').setScale(0.3)

        this.attemptsText = this.add.text(140, 72, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffdd55',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(1160, 90, '', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        this.feedbackText = this.add.text(640, 130, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#7CFC00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.cards = [];
        this.buildBoard();
        this.createBackButton();
        this.updateHUD();
    }

    buildBoard() {

        const deck = Phaser.Utils.Array.Shuffle(
            this.letters.flatMap(l => [{ letter: l, kind: 'may' }, { letter: l, kind: 'min' }])
        );

        const { cols, rows, cellWidth, cellHeight, gap } = MEMORY_CONFIG;
        const gridWidth = cols * cellWidth + (cols - 1) * gap;
        const startX = 640 - gridWidth / 2 + cellWidth / 2;
        const startY = 160 + cellHeight / 2;

        deck.forEach((card, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (cellWidth + gap);
            const y = startY + row * (cellHeight + gap);
            this.createCard(x, y, cellWidth, cellHeight, card);
        });
    }

    createCard(x, y, w, h, card) {
        const container = this.add.container(x, y);
        const { letter, kind } = card;

        const backPanel = makeImage(this, 'carta_reverso', w, h);

        const frontImg = this.add.container(0, 0);
        frontImg.add(makeImage(this, 'carta_frente', w, h));
        const lk = letterKey(kind, letter);
        if (this.textures.exists(lk)) {
            const img = this.add.image(0, 0, lk);
            img.setScale(Math.min((w - 24) / img.width, (h - 16) / img.height));
            frontImg.add(img);
        } else {
            frontImg.add(this.add.text(0, 2, kind === 'may' ? letter.toUpperCase() : letter.toLowerCase(), {
                fontFamily: 'Arial',
                fontSize: '70px',
                color: kind === 'may' ? COLORS.purple : '#e8590c',
                fontStyle: 'bold'
            }).setOrigin(0.5));
        }
        frontImg.setVisible(false);

        container.add([backPanel, frontImg]);
        container.setSize(w, h);
        container.setInteractive({ useHandCursor: true });

        container.backPanel = backPanel;
        container.frontImg = frontImg;

        container.setData('character', letter);
        container.setData('kind', kind);
        container.setData('flipped', false);
        container.setData('matched', false);

        container.on('pointerover', () => {
            if (!container.getData('flipped') && !container.getData('matched')) {
                this.tweens.add({ targets: container, scale: 1.04, duration: 100 });
            }
        });
        container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });
        container.on('pointerdown', () => this.handleCardClick(container));

        this.cards.push(container);
        return container;
    }

    handleCardClick(container) {
        if (this.busy) return;
        if (container.getData('flipped') || container.getData('matched')) return;

        this.flipCard(container, true);
        container.setData('flipped', true);

        if (!this.firstCard) {
            this.firstCard = container;
            return;
        }

        this.secondCard = container;
        this.attempts++;
        this.updateHUD();
        this.busy = true;

        this.time.delayedCall(MEMORY_CONFIG.flipDelayMs, () => this.evaluateMatch());
    }

    evaluateMatch() {
        const a = this.firstCard;
        const b = this.secondCard;

        if (a.getData('character') === b.getData('character')) {
            a.setData('matched', true);
            b.setData('matched', true);
            a.disableInteractive();
            b.disableInteractive();

            this.matchedPairs++;
            this.score += MEMORY_CONFIG.matchScore;
            this.flashFeedback('¡Pareja encontrada! 🎉', '#7CFC00');

            this.tweens.add({ targets: [a, b], scale: 1.08, yoyo: true, duration: 150 });

            this.resetSelection();
            this.updateHUD();

            if (this.matchedPairs >= this.totalPairs) {
                this.time.delayedCall(500, () => this.endGame());
            }
        } else {
            this.score = Math.max(0, this.score - MEMORY_CONFIG.mismatchPenalty);
            this.flashFeedback('Intenta de nuevo', '#EF476F');

            this.flipCard(a, false);
            this.flipCard(b, false);
            a.setData('flipped', false);
            b.setData('flipped', false);

            this.resetSelection();
            this.updateHUD();
        }
    }

    resetSelection() {
        this.firstCard = null;
        this.secondCard = null;
        this.busy = false;
    }

    flipCard(container, toFront) {
        this.tweens.add({
            targets: container,
            scaleX: 0,
            duration: 120,
            ease: 'Sine.easeIn',
            onComplete: () => {
                container.backPanel.setVisible(!toFront);
                container.frontImg.setVisible(toFront);
                this.tweens.add({ targets: container, scaleX: 1, duration: 120, ease: 'Sine.easeOut' });
            }
        });
    }

    flashFeedback(msg, color) {
        this.feedbackText.setColor(color);
        this.feedbackText.setText(msg);
        this.tweens.killTweensOf(this.feedbackText);
        this.feedbackText.setAlpha(1);
        this.tweens.add({ targets: this.feedbackText, alpha: 0, duration: 700, delay: 500 });
    }

    updateHUD() {
        this.attemptsText.setText(`${this.matchedPairs} / ${this.totalPairs}`);
        this.scoreText.setText('' + this.score);
    }

    endGame() {
        this.feedbackText.setText('');

        this.cards.forEach(card => card.disableInteractive());
        this.tweens.add({
            targets: this.cards,
            alpha: 0,
            duration: 350,
            onComplete: () => {
                this.cards.forEach(card => card.setVisible(false));
                showResults(this, {
                    stars: this.calculateStars(),
                    score: this.score,
                    detail: `${this.totalPairs} parejas en ${this.attempts} intentos`
                });
            }
        });
    }

    calculateStars() {
        if (this.attempts <= this.totalPairs * 1.5) return 3;
        if (this.attempts <= this.totalPairs * 2.5) return 2;
        return 1;
    }

    createBackButton() {
        const backBtn = this.add.image(80, 660, 'control')
            .setDisplaySize(90, 90)
            .setInteractive({ useHandCursor: true });
        this.backButton = backBtn;
        const baseScale = backBtn.scaleX;

        backBtn.on('pointerover', () => {
            this.tweens.add({ targets: backBtn, scale: baseScale * 1.15, duration: 120 });
        });
        backBtn.on('pointerout', () => {
            this.tweens.add({ targets: backBtn, scale: baseScale, duration: 120 });
        });
        backBtn.on('pointerdown', () => this.scene.start('Actividades'));
    }
}
