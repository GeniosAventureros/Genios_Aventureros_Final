import { activities } from './activities.js';
import { preloadStars, showResults, starsFromAccuracy } from '../stars.js';
import { preloadUI, makeImage, setPanel, makePanel, addButtonFx } from '../ui.js';

export class RompecabezasFrases extends Phaser.Scene {

    constructor() {
        super('RompecabezasFrases');
    }

    init(data) {
        this.activityId = data.activityId;
        this.sentenceIndex = 0;
        this.score = 0;
        this.locked = false;
        this.mistakes = 0;
    }

    preload() {
        this.load.image('Fondo_Frases', 'assets/Arma/fondoFrases.png');
        this.load.image('control', 'assets/Arma/control.png');
        this.load.image('letrero', 'assets/Arma/Forma_F.png')
        this.load.image('puntos', 'assets/Arma/puntos.png')
        this.load.image('contador', 'assets/Arma/frases_C.png')
        this.load.image('titulo_R', 'assets/Arma/rompecabezas_T.png')
        preloadUI(this, ['casilla', 'casilla_error', 'ficha', 'btn_verificar']);
        preloadStars(this);
    }

    create() {
        this.activity = activities.find(a => a.id === this.activityId);
        this.sentences = Phaser.Utils.Array.Shuffle([...this.activity.sentences]);

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.add.image(640, 360, 'Fondo_Frases').setScale(0.23);
        this.add.image(200, 500, 'letrero').setScale(0.12)
        this.add.image(140, 120, 'contador').setScale(0.15)

        this.add.image(640, 75, 'titulo_R').setScale(0.10)

        this.roundText = this.add.text(143, 138, '', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#000000',
        fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createScorePanel();
        this.createVerifyButton();
        this.createBackButton();
        this.setupDragEvents();

        this.feedbackText = this.add.text(640, 260, '', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#7CFC00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.roundContainer = this.add.container(0, 0);

        this.startRound();
    }

    createScorePanel() {
        this.add.image(1100,20, 'puntos').setScale(0.4)

        this.scoreText = this.add.text(1095, 85, '0', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    addScore(delta) {
        this.score = Math.max(0, this.score + delta);
        this.scoreText.setText(this.score.toString());
    }

    startRound() {
        this.locked = false;

        if (this.sentenceIndex >= this.sentences.length) {
            this.showFinalScreen();
            return;
        }

        this.roundContainer.removeAll(true);
        this.feedbackText.setText('');
        this.roundText.setText(`${this.sentenceIndex + 1} / ${this.sentences.length}`);

        this.correctWords = this.sentences[this.sentenceIndex];
        const shuffled = Phaser.Utils.Array.Shuffle([...this.correctWords]);

        this.slots = new Array(this.correctWords.length).fill(null);
        this.buildSlots();
        this.buildTrayChips(shuffled);
    }

    wordChipWidth(word) {
        return Math.max(90, word.length * 18 + 40);
    }

    drawSlotBox(zone, width, height, error = false) {
        setPanel(this, zone.box, error ? 'casilla_error' : 'casilla', width, height);
        zone.width = width;
        zone.height = height;
        zone.setRectangleDropZone(width, height);
    }

    layoutSlots() {
        const gap = 14;
        const slotHeight = 64;
        const y = 340;

        const widths = this.slotZones.map((zone, i) => {
            const chip = this.slots[i];
            return chip
                ? Math.min(this.wordChipWidth(chip.getData('word')), zone.defaultWidth)
                : zone.defaultWidth;
        });

        const totalWidth = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
        let x = 640 - totalWidth / 2;

        this.slotZones.forEach((zone, i) => {
            const width = widths[i];
            const centerX = x + width / 2;

            this.drawSlotBox(zone, width, slotHeight);

            this.tweens.add({
                targets: [zone, zone.box],
                x: centerX,
                y: y,
                duration: 220,
                ease: 'Sine.easeInOut'
            });

            zone.baseX = centerX;
            zone.baseY = y;

            const chip = this.slots[i];
            if (chip) {
                this.tweens.add({
                    targets: chip,
                    x: centerX,
                    y: y,
                    duration: 220,
                    ease: 'Sine.easeInOut'
                });
            }

            x += width + gap;
        });
    }

    buildSlots() {
        const count = this.correctWords.length;
        const slotHeight = 64;
        const gap = 14;

        const widths = this.correctWords.map(w => this.wordChipWidth(w));
        const slotWidth = Math.max(...widths);
        const totalWidth = slotWidth * count + gap * (count - 1);

        let x = 640 - totalWidth / 2;
        const y = 340;

        this.slotZones = [];

        for (let i = 0; i < count; i++) {
            const centerX = x + slotWidth / 2;

            const box = this.add.container(centerX, y);

            const zone = this.add.zone(centerX, y, slotWidth, slotHeight).setRectangleDropZone(slotWidth, slotHeight);
            zone.setData('slotIndex', i);
            zone.box = box;
            zone.baseX = centerX;
            zone.baseY = y;
            zone.defaultWidth = slotWidth;

            this.drawSlotBox(zone, slotWidth, slotHeight);

            this.roundContainer.add([box, zone]);
            this.slotZones.push(zone);

            x += slotWidth + gap;
        }
    }

    buildTrayChips(words) {
        const chipHeight = 60;
        const gap = 14;
        const y = 480;

        const widths = words.map(w => this.wordChipWidth(w));
        const totalWidth = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
        let x = 640 - totalWidth / 2;

        this.trayChips = [];

        words.forEach((word, i) => {
            const width = widths[i];
            const chipX = x + width / 2;
            this.createWordChip(chipX, y, width, chipHeight, word);
            x += width + gap;
        });
    }

    createWordChip(x, y, width, height, word) {
        const chip = this.add.container(x, y);

        const box = makePanel(this, 'ficha', width, height);

        const text = this.add.text(0, 0, word, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        chip.add([box, text]);
        chip.setSize(width, height);
        chip.setData('word', word);
        chip.setData('originalPosition', { x, y });
        chip.setData('slotIndex', null);

        chip.setInteractive({ useHandCursor: true });
        this.input.setDraggable(chip);

        this.roundContainer.add(chip);
        this.trayChips.push(chip);
    }

    setupDragEvents() {
        this.input.on('dragstart', (pointer, gameObject) => {
            if (!this.trayChips || !this.trayChips.includes(gameObject)) return;
            this.children.bringToTop(gameObject);

            const currentSlot = gameObject.getData('slotIndex');
            if (currentSlot !== null) {
                this.slots[currentSlot] = null;
                gameObject.setData('slotIndex', null);
                this.layoutSlots();
            }
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!this.trayChips || !this.trayChips.includes(gameObject)) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('drop', (pointer, gameObject, dropZone) => {
            if (!this.trayChips || !this.trayChips.includes(gameObject)) return;
            if (!this.slotZones.includes(dropZone)) return;

            const targetIndex = dropZone.getData('slotIndex');

            if (this.slots[targetIndex] !== null) return;

            this.slots[targetIndex] = gameObject;
            gameObject.setData('slotIndex', targetIndex);

            this.layoutSlots();
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (!this.trayChips || !this.trayChips.includes(gameObject)) return;

            const currentSlot = gameObject.getData('slotIndex');

            if (currentSlot === null) {
                const pos = gameObject.getData('originalPosition');
                this.tweens.add({ targets: gameObject, x: pos.x, y: pos.y, duration: 200 });
            }
        });
    }

    createVerifyButton() {
        const x = 640;
        const y = 590;
        const width = 220;
        const height = 60;

        const img = makeImage(this, 'btn_verificar', width, height, x, y);
        const zone = this.add.zone(x, y, width, height).setInteractive({ useHandCursor: true });

        addButtonFx(this, img, zone);
        zone.on('pointerdown', () => this.verifyAnswer());

        this.verifyButton = this.add.container(0, 0, [img, zone]);
    }

    verifyAnswer() {
        if (this.locked) return;

        if (this.slots.some(s => s === null)) {
            this.feedbackText.setColor('#ffcc00');
            this.feedbackText.setText('Completa todos los espacios primero');
            return;
        }

        this.locked = true;

        const currentOrder = this.slots.map(chip => chip.getData('word'));
        const isCorrect = currentOrder.every((word, i) => word === this.correctWords[i]);

        if (isCorrect) {
            this.addScore(150);
            this.feedbackText.setColor('#000000');
            this.feedbackText.setText('¡Muy bien! 🎉');

            this.time.delayedCall(1200, () => {
                this.sentenceIndex++;
                this.startRound();
            });
        } else {
            this.addScore(-30);
            this.mistakes++;
            this.feedbackText.setColor('#ff0000');
            this.feedbackText.setText('No es correcto, ¡vamos de nuevo!');
            this.shakeSlots();

            this.time.delayedCall(900, () => {
                this.startRound();
            });
        }
    }

    shakeSlots() {
        this.slotZones.forEach(zone => {
            this.drawSlotBox(zone, zone.width, zone.height, true);
            this.tweens.add({ targets: zone.box, x: zone.box.x + 6, duration: 50, yoyo: true, repeat: 3 });
        });

        this.time.delayedCall(400, () => {
            this.slotZones.forEach(zone => {
                if (zone.box.active) this.drawSlotBox(zone, zone.width, zone.height, false);
            });
        });
    }

    showFinalScreen() {
        this.roundContainer.removeAll(true);
        this.roundText.setText('');
        this.feedbackText.setText('');

        if (this.verifyButton) {
            this.verifyButton.setVisible(false);
            this.verifyButton.list.forEach(o => o.input && o.disableInteractive());
        }

        const total = this.sentences.length;
        showResults(this, {
            stars: starsFromAccuracy(total, this.mistakes),
            score: this.score,
            detail: `${total} frases · ${this.mistakes} ${this.mistakes === 1 ? 'error' : 'errores'}`
        });
    }

    createBackButton() {
        const backBtn = this.add.image(80, 625, 'control')
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
        backBtn.on('pointerdown', () => this.scene.start('Actividades'));
    }
}