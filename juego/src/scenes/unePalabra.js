import { activities } from './activities.js';
import { preloadStars, showResults, starsFromAccuracy } from '../stars.js';
import { preloadUI, makePanel, setPanel } from '../ui.js';

export class UnePalabraImagen extends Phaser.Scene {

    constructor() {
        super('UnePalabraImagen');
    }

    init(data) {
        this.activityId = data.activityId;
        this.score = 0;
        this.matchedCount = 0;
        this.mistakes = 0;
        this.selectedChip = null;

        this.activity = activities.find(a => a.id === this.activityId);

        const allPairs = this.activity.pairs;
        const roundSize = this.activity.pairsPerRound || allPairs.length;
        this.pairs = Phaser.Utils.Array.Shuffle([...allPairs]).slice(0, roundSize);
    }

    preload() {
        this.load.image('titulo', 'assets/fondo.png');
        this.load.image('background1', 'assets/fondo2.png');
        this.load.image('control1', 'assets/Une/btn_control.png');
        this.load.image('avion', 'assets/Une/btn_avion.png');
        this.load.image('bosque', 'assets/Une/btn_bosque.png');
        this.load.image('balon', 'assets/Une/btn_balon.png');
        this.load.image('casa', 'assets/Une/btn_casa.png');
        this.load.image('carro', 'assets/Une/btn_carro.png');
        this.load.image('computadora', 'assets/Une/btn_computadora.png');
        this.load.image('estrella', 'assets/Une/btn_estrella.png');
        this.load.image('flor', 'assets/Une/btn_flor.png');
        this.load.image('gato', 'assets/Une/btn_gato.png');
        this.load.image('helado', 'assets/Une/btn_helado.png');
        this.load.image('luna', 'assets/Une/btn_luna.png');
        this.load.image('mochila', 'assets/Une/btn_mochila.png');
        this.load.image('nave', 'assets/Une/btn_nave.png');
        this.load.image('pajaro', 'assets/Une/btn_pajaro.png');
        this.load.image('perro', 'assets/Une/btn_perro.png');
        this.load.image('sol', 'assets/Une/btn_sol.png');
        this.load.image('libro', 'assets/Une/btn_libro.png');
        this.load.image('control', 'assets/Une/control.png');
        this.load.image('une_T', 'assets/Une/une_T.png');
        preloadUI(this, ['ficha', 'ficha_sel', 'ficha_ok', 'panel_puntos']);
        preloadStars(this);

    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.add.image(640, 360, 'background1').setScale(0.23);
        this.add.image(640, 55, 'une_T').setScale(0.08);


        this.createScorePanel();
        this.buildBoard();
        this.createBackButton();

    }

    createScorePanel() {
        makePanel(this, 'panel_puntos', 170, 76, 1160, 56);

        this.add.text(1160, 40, ' Puntos', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#e6dcff'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(1160, 65, '0', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#ffdd55',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    addScore(delta) {
        this.score = Math.max(0, this.score + delta);
        this.scoreText.setText(this.score.toString());
    }

    buildBoard() {
        const count = this.pairs.length;
        const leftX = 380;
        const rightX = 900;

        const areaTop = 140;
        const areaBottom = 620;
        const spacing = count > 1 ? (areaBottom - areaTop) / (count - 1) : 0;
        const startY = count > 1 ? areaTop : (areaTop + areaBottom) / 2;

        const wordOrder = Phaser.Utils.Array.NumberArray(0, count - 1);
        Phaser.Utils.Array.Shuffle(wordOrder);

        let imageOrder;
        let attempts = 0;
        do {
            imageOrder = Phaser.Utils.Array.NumberArray(0, count - 1);
            Phaser.Utils.Array.Shuffle(imageOrder);
            attempts++;
        } while (
            attempts < 30 &&
            wordOrder.some((pairIndex, slot) => pairIndex === imageOrder[slot])
        );

        this.dropZones = [];
        this.chips = [];

        wordOrder.forEach((pairIndex, slot) => {
            const y = startY + slot * spacing;
            this.createWordChip(leftX, y, pairIndex);
        });

        imageOrder.forEach((pairIndex, slot) => {
            const y = startY + slot * spacing;
            this.createImageTarget(rightX, y, pairIndex);
        });
    }

    createWordChip(x, y, pairIndex) {
        const word = this.pairs[pairIndex].word;
        const width = 180;
        const height = 64;

        const chip = this.add.container(x, y);

        const box = this.add.container(0, 0);

        const text = this.add.text(0, 0, word, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        chip.add([box, text]);
        chip.setSize(width, height);
        chip.setData('pairIndex', pairIndex);
        chip.setData('originalPosition', { x, y });
        chip.box = box;
        chip.wordText = text;

        this.drawChipBox(chip, false);

        chip.setInteractive({ useHandCursor: true });
        chip.on('pointerdown', () => this.onWordTap(chip));

        this.chips.push(chip);
    }

    drawChipBox(chip, selected) {
        setPanel(this, chip.box, selected ? 'ficha_sel' : 'ficha', 180, 64);
    }

    createImageTarget(x, y, pairIndex) {

        const imageSize = 100;
        const zoneSize = 100;

        const pairImage = this.add.image(x, y, this.pairs[pairIndex].key)
            .setDisplaySize(imageSize, imageSize);

        const zone = this.add.zone(x, y, zoneSize, zoneSize)
            .setInteractive({ useHandCursor: true });
        zone.setData('pairIndex', pairIndex);
        zone.setData('used', false);
        zone.pairImage = pairImage;

        zone.on('pointerdown', () => this.onImageTap(zone));

        this.dropZones.push(zone);
    }

    onWordTap(chip) {
        if (chip.getData('locked')) return;

        if (this.selectedChip === chip) {
            this.setChipSelected(chip, false);
            this.selectedChip = null;
            return;
        }

        if (this.selectedChip) {
            this.setChipSelected(this.selectedChip, false);
        }

        this.selectedChip = chip;
        this.setChipSelected(chip, true);
    }

    setChipSelected(chip, selected) {
        this.drawChipBox(chip, selected);
        this.tweens.add({ targets: chip, scale: selected ? 1.06 : 1, duration: 120 });
    }

    onImageTap(zone) {
        if (zone.getData('used')) return;

        if (!this.selectedChip) {
            this.flashWrong(zone.pairImage);
            return;
        }

        const chip = this.selectedChip;
        const chipPair = chip.getData('pairIndex');
        const zonePair = zone.getData('pairIndex');

        if (chipPair === zonePair) {
            this.handleMatch(chip, zone);
        } else {
            this.addScore(-20);
            this.mistakes++;
            this.flashWrong(chip);
            this.flashWrong(zone.pairImage);
            this.setChipSelected(chip, false);
        }

        this.selectedChip = null;
    }

    handleMatch(chip, zone) {
        chip.setData('locked', true);
        zone.setData('used', true);
        chip.disableInteractive();
        zone.disableInteractive();

        this.tweens.add({ targets: chip, scale: 1, duration: 120 });

        const pillWidth = 240;
        const pillHeight = 64;

        setPanel(this, chip.box, 'ficha_ok', pillWidth, pillHeight);

        chip.wordText.setPosition(30, 0);

        const pairKey = this.pairs[chip.getData('pairIndex')].key;
        const pillImage = this.add.image(-85, 0, pairKey).setDisplaySize(40, 40);
        chip.add(pillImage);

        this.tweens.add({
            targets: zone.pairImage,
            alpha: 0,
            scale: 0.7,
            duration: 250,
            onComplete: () => zone.pairImage.destroy()
        });

        this.addScore(100);
        this.matchedCount++;
        this.checkWin();
    }

    flashWrong(target) {
        this.tweens.add({
            targets: target,
            alpha: 0.3,
            duration: 90,
            yoyo: true,
            repeat: 1
        });
    }

    checkWin() {
        if (this.matchedCount === this.pairs.length) {
            this.tweens.add({
                targets: this.chips,
                alpha: 0,
                duration: 350,
                onComplete: () => {
                    showResults(this, {
                        stars: starsFromAccuracy(this.pairs.length, this.mistakes),
                        score: this.score,
                        detail: `${this.pairs.length} parejas · ${this.mistakes} ${this.mistakes === 1 ? 'error' : 'errores'}`
                    });
                }
            });
        }
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