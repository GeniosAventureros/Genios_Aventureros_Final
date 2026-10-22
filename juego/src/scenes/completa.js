import { activities } from './activities.js';
import { preloadStars, showResults, starsFromAccuracy } from '../stars.js';
import { preloadUI, makeImage, makePanel, swapImage, addButtonFx } from '../ui.js';

export class CompletaPalabra extends Phaser.Scene {

    constructor() {
        super('CompletaPalabra');
    }

    init(data) {
        this.activityId = data.activityId;
        this.wordIndex = 0;
        this.score = 0;
        this.mistakes = 0;
        this.correctLetters = 0;
    }

    preload() {
        this.load.image('background', 'assets/fondo1.png');
        this.load.image('control', 'assets/control.png');
        this.load.image('Letra_T', 'assets/Letra/Letra_T.png');    
        preloadUI(this, ['casilla_letra', 'casilla_letra_ok', 'boton_letra', 'btn_escuchar', 'panel_puntos']);
        preloadStars(this);
    }

    create() {
        this.activity = activities.find(a => a.id === this.activityId);
        this.words = Phaser.Utils.Array.Shuffle([...this.activity.words.map(w => w.toUpperCase())]);

        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.add.image(640, 360, 'background').setScale(0.16);

        this.add.image(640, 80, 'Letra_T').setScale(0.08);

        makePanel(this, 'panel_puntos', 200, 76, 1130, 62);

        this.roundText = this.add.text(1130, 44, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#e6dcff'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(1130, 78, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffdd55',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.feedbackText = this.add.text(640, 590, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#7CFC00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.letterBoxContainer = this.add.container(0, 0);
        this.optionButtonsContainer = this.add.container(0, 0);

        this.createSpeakButton();
        this.createBackButton();

        this.startRound();
    }

    startRound() {
        if (this.wordIndex >= this.words.length) {
            this.showFinalScreen();
            return;
        }

        this.currentWord = this.words[this.wordIndex];
        this.roundText.setText(`Palabra ${this.wordIndex + 1} / ${this.words.length}`);
        this.scoreText.setText(`${this.score}`);
        this.feedbackText.setText('');

        this.blankIndices = this.pickBlankIndices(this.currentWord);
        this.filledLetters = this.currentWord.split('').map((letter, i) =>
            this.blankIndices.includes(i) ? null : letter
        );
        this.nextBlankPointer = 0;

        this.buildLetterBoxes();
        this.buildOptionButtons();

        this.time.delayedCall(300, () => this.speakWord());
    }

    pickBlankIndices(word) {
        let blankCount = 1;
        if (word.length >= 7) blankCount = 3;
        else if (word.length >= 5) blankCount = 2;

        const indices = Phaser.Utils.Array.NumberArray(0, word.length - 1);
        Phaser.Utils.Array.Shuffle(indices);
        return indices.slice(0, blankCount).sort((a, b) => a - b);
    }

    speakWord() {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(this.currentWord);
        utterance.lang = 'es-ES';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }

    createSpeakButton() {
        const img = makeImage(this, 'btn_escuchar', 200, 60, 640, 185);
        const zone = this.add.zone(640, 185, 200, 60).setInteractive({ useHandCursor: true });

        addButtonFx(this, img, zone);
        zone.on('pointerdown', () => this.speakWord());
    }

    buildLetterBoxes() {
        this.letterBoxContainer.removeAll(true);
        this.letterBoxSprites = [];

        const boxSize = 60;
        const gap = 10;
        const word = this.currentWord;
        const totalWidth = word.length * boxSize + (word.length - 1) * gap;
        const startX = 640 - totalWidth / 2 + boxSize / 2;
        const y = 300;

        word.split('').forEach((letter, i) => {
            const x = startX + i * (boxSize + gap);

            const box = makeImage(this, 'casilla_letra', boxSize, boxSize, x, y);

            const isBlank = this.blankIndices.includes(i);
            const text = this.add.text(x, y, isBlank ? '' : letter, {
                fontFamily: 'Arial',
                fontSize: '34px',
                color: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.letterBoxContainer.add([box, text]);
            this.letterBoxSprites[i] = { box, text, x, y, isBlank };
        });
    }

    buildOptionButtons() {
        this.optionButtonsContainer.removeAll(true);

        const missingLetters = this.blankIndices.map(i => this.currentWord[i]);
        const decoyCount = 2;
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const decoys = [];

        while (decoys.length < decoyCount) {
            const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
            if (!missingLetters.includes(letter) && !decoys.includes(letter)) {
                decoys.push(letter);
            }
        }

        const options = Phaser.Utils.Array.Shuffle([...missingLetters, ...decoys]);

        const boxSize = 66;
        const gap = 16;
        const totalWidth = options.length * boxSize + (options.length - 1) * gap;
        const startX = 640 - totalWidth / 2 + boxSize / 2;
        const y = 460;

        options.forEach((letter, index) => {
            const x = startX + index * (boxSize + gap);
            this.createOptionButton(x, y, boxSize, letter);
        });
    }

    createOptionButton(x, y, size, letter) {
        const box = makeImage(this, 'boton_letra', size, size, x, y);

        const text = this.add.text(x, y, letter, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const zone = this.add.zone(x, y, size, size).setInteractive({ useHandCursor: true });

        this.optionButtonsContainer.add([box, text, zone]);

        const boxBase = box.scaleX;
        const hover = (on) => {
            if (!zone.input || !zone.input.enabled) return;
            this.tweens.add({ targets: box, scale: boxBase * (on ? 1.1 : 1), duration: 100 });
            this.tweens.add({ targets: text, scale: on ? 1.1 : 1, duration: 100 });
        };
        zone.on('pointerover', () => hover(true));
        zone.on('pointerout', () => hover(false));

        zone.on('pointerdown', () => {
            this.handleLetterChoice(letter, { box, text, zone });
        });
    }

    handleLetterChoice(letter, buttonRefs) {
        const targetIndex = this.blankIndices[this.nextBlankPointer];
        const correctLetter = this.currentWord[targetIndex];

        if (letter === correctLetter) {
            this.placeCorrectLetter(targetIndex, letter);
            buttonRefs.zone.disableInteractive();
            buttonRefs.box.setAlpha(0.25);
            buttonRefs.text.setAlpha(0.25);

            this.nextBlankPointer++;

            if (this.nextBlankPointer >= this.blankIndices.length) {
                this.completeRound();
            }
        } else {
            this.mistakes++;
            this.flashWrong(buttonRefs.box);
        }
    }

    placeCorrectLetter(index, letter) {
        this.correctLetters++;
        const slot = this.letterBoxSprites[index];
        slot.text.setText(letter);
        slot.text.setColor('#2e7d32');

        swapImage(this, slot.box, 'casilla_letra_ok', 60, 60);
        this.tweens.add({ targets: slot.box, scale: slot.box.scaleX * 1.15, duration: 120, yoyo: true });
        this.tweens.add({ targets: slot.text, scale: 1.15, duration: 120, yoyo: true });
    }

    flashWrong(box) {
        this.tweens.add({
            targets: box,
            alpha: 0.3,
            duration: 90,
            yoyo: true,
            repeat: 1
        });
    }

    completeRound() {
        this.score += 150;
        this.scoreText.setText(`${this.score}`);
        this.feedbackText.setText('¡Muy bien!');

        this.time.delayedCall(1200, () => {
            this.wordIndex++;
            this.startRound();
        });
    }

    showFinalScreen() {
        this.letterBoxContainer.removeAll(true);
        this.optionButtonsContainer.removeAll(true);
        this.roundText.setText('');
        this.feedbackText.setText('');

        showResults(this, {
            stars: starsFromAccuracy(this.correctLetters, this.mistakes),
            score: this.score,
            detail: `${this.words.length} palabras · ${this.mistakes} ${this.mistakes === 1 ? 'error' : 'errores'}`
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
        backBtn.on('pointerdown', () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            this.scene.start('Actividades');
        });
    }
}