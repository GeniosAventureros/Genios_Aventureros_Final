import { stories } from './stories.js';
import { preloadUI, makeImage, addButtonFx } from '../ui.js';

export class CuentaCuentos extends Phaser.Scene {

    constructor() {
        super('CuentaCuentos');
    }

    init(data) {
        this.storyId = data.storyId;
        this.pageIndex = 0;
        this.autoAdvance = false;
        this.visitedPages = new Set();

        this.story = stories.find(s => s.id === this.storyId);
    }

    preload() {
        this.load.image('background', 'assets/fondo1.png');
        this.load.image('arrowLeft', 'assets/left.png');
        this.load.image('arrowRight', 'assets/right.png');
        this.load.image('Narrar', 'assets/Narracion.png');
        this.load.image('Silencio', 'assets/Silencio.png');
        this.load.image('libro_boton', 'assets/Cuentos/libro_boton.png');
        preloadUI(this, ['btn_terminar_lectura']);
        if (this.story.titleImage) {
            this.load.image(this.story.titleImage.key, this.story.titleImage.path);
        }
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        this.add.image(640, 360, 'background').setScale(0.16);

        this.createTitle();

        this.imageAreaX = 640;
        this.imageAreaY = 235;
        this.pageImage = this.add.image(this.imageAreaX, this.imageAreaY, '__DEFAULT').setVisible(false);
        this.imageMaskGraphics = this.make.graphics();

        const boxX = 190;
        const boxY = 400;
        const boxWidth = 900;
        const boxHeight = 230;

        this.textBox = this.add.graphics();
        this.textBox.fillStyle(0xffffff, 1);
        this.textBox.lineStyle(3, 0xdddddd, 1);
        this.textBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 24);
        this.textBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 24);

        this.pageText = this.add.text(boxX + boxWidth / 2, boxY + boxHeight / 2, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#000000',
            align: 'center',
            wordWrap: { width: boxWidth - 80 }
        }).setOrigin(0.5);

        this.pageCounter = this.add.text(boxX + boxWidth - 20, boxY + boxHeight - 16, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#888888'
        }).setOrigin(1, 1);

        this.createFinishButton();
        this.createNavButtons(boxY + boxHeight / 2);
        this.createNarratorButton();
        this.createBackButton();
        this.renderPage();
    }

    createTitle() {
        const titleX = 640;
        const titleY = 50;

        if (this.story.titleImage) {
           

            const maxWidth = 500;
            const maxHeight = 90;
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            img.setScale(scale);
        } else {
            this.add.text(titleX, titleY, this.story.title, {
                fontFamily: 'Arial',
                fontSize: '40px',
                color: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }
    }

    createFinishButton() {
        const x = 640, y = 672;
        const img = makeImage(this, 'btn_terminar_lectura', 300, 60, x, y);
        const zone = this.add.zone(x, y, 300, 60).setInteractive({ useHandCursor: true });
        addButtonFx(this, img, zone);
        zone.on('pointerdown', () => {
            this.stopNarration();
            this.scene.start('Preguntas', { storyId: this.storyId });
        });
        this.finishButton = this.add.container(0, 0, [img, zone]);
        this.finishButton.setVisible(false);
        zone.disableInteractive();
        this.finishZone = zone;
    }

    updateFinishButton() {
        const done = this.visitedPages.size >= this.story.pages.length
            && this.pageIndex === this.story.pages.length - 1;
        this.finishButton.setVisible(done);
        if (done) {
            if (!this.finishZone.input.enabled) this.finishZone.setInteractive({ useHandCursor: true });
        } else if (this.finishZone.input.enabled) {
            this.finishZone.disableInteractive();
        }
    }

    renderPage() {
    const page = this.story.pages[this.pageIndex];
    this.visitedPages.add(this.pageIndex);

    this.pageText.setText(page.text);
    this.pageCounter.setText(`${this.pageIndex + 1} / ${this.story.pages.length}`);

    if (page.image && this.textures.exists(page.image)) {
        this.pageImage.setTexture(page.image).setVisible(true);

        const maxWidth = 650;
        const maxHeight = 260;

        const scale = Math.min(maxWidth / this.pageImage.width, maxHeight / this.pageImage.height);
        this.pageImage.setScale(scale);

        const displayWidth = this.pageImage.displayWidth;
        const displayHeight = this.pageImage.displayHeight;
        const cornerRadius = 20;

        this.imageMaskGraphics.clear();
        this.imageMaskGraphics.fillStyle(0xffffff, 1);
        this.imageMaskGraphics.fillRoundedRect(
            this.imageAreaX - displayWidth / 2,
            this.imageAreaY - displayHeight / 2,
            displayWidth,
            displayHeight,
            cornerRadius
        );

        const mask = this.imageMaskGraphics.createGeometryMask();
        this.pageImage.setMask(mask);

    } else {
        this.pageImage.setVisible(false);
        this.pageImage.clearMask();
    }

    this.prevButton.setVisible(this.pageIndex > 0);
    this.nextButton.setVisible(this.pageIndex < this.story.pages.length - 1);

    this.prevButton.setVisible(this.pageIndex > 0);
    this.nextButton.setVisible(this.pageIndex < this.story.pages.length - 1);
    this.updateFinishButton();
}

    createNavButtons(centerY) {
        const arrowSize = 70;

        this.prevButton = this.add.image(110, centerY, 'arrowLeft')
            .setInteractive({ useHandCursor: true });
        this.prevButton.setDisplaySize(arrowSize, arrowSize);
        const prevBaseScale = this.prevButton.scaleX;

        this.nextButton = this.add.image(1170, centerY, 'arrowRight')
            .setInteractive({ useHandCursor: true });
        this.nextButton.setDisplaySize(arrowSize, arrowSize);
        const nextBaseScale = this.nextButton.scaleX;

        this.prevButton.on('pointerdown', () => {
            if (this.pageIndex > 0) {
                this.stopNarration();
                this.pageIndex--;
                this.renderPage();
            }
        });

        this.nextButton.on('pointerdown', () => {
            if (this.pageIndex < this.story.pages.length - 1) {
                this.stopNarration();
                this.pageIndex++;
                this.renderPage();
            }
        });

        this.prevButton.on('pointerover', () => {
            this.tweens.add({ targets: this.prevButton, scale: prevBaseScale * 1.15, duration: 120 });
        });
        this.prevButton.on('pointerout', () => {
            this.tweens.add({ targets: this.prevButton, scale: prevBaseScale, duration: 120 });
        });

        this.nextButton.on('pointerover', () => {
            this.tweens.add({ targets: this.nextButton, scale: nextBaseScale * 1.15, duration: 120 });
        });
        this.nextButton.on('pointerout', () => {
            this.tweens.add({ targets: this.nextButton, scale: nextBaseScale, duration: 120 });
        });
    }

    createNarratorButton() {
        this.isNarrating = false;

        const btnX = 1150;
        const btnY = 110;
        const frameSize = 0;

        this.narratorFrame = this.add.graphics();
        this.narratorFrame.fillStyle(0x1b1b2f, 0.9);
        this.narratorFrame.lineStyle(3, 0xffdd55, 0.6);
        this.narratorFrame.fillRoundedRect(btnX - frameSize / 2, btnY - frameSize / 2, frameSize, frameSize, 16);
        this.narratorFrame.strokeRoundedRect(btnX - frameSize / 2, btnY - frameSize / 2, frameSize, frameSize, 16);

        this.narratorIcon = this.add.image(btnX, btnY, 'Narrar')
            .setDisplaySize(80, 80)
            .setInteractive({ useHandCursor: true });

        this.narratorIcon.on('pointerover', () => this.narratorIcon.setAlpha(0.8));
        this.narratorIcon.on('pointerout', () => this.narratorIcon.setAlpha(1));
        this.narratorIcon.on('pointerdown', () => {
            if (this.isNarrating) {
                this.stopNarration();
            } else {
                this.autoAdvance = true;
                this.speakPage();
            }
        });
        this.events.on('shutdown', () => this.stopNarration());
    }

    updateNarratorIcon(active) {
        if (this.narratorIcon && this.narratorIcon.scene) {
            this.narratorIcon.setTexture(active ? 'Silencio' : 'Narrar');
        }
    }

    pickBestSpanishVoice(voices) {
        if (!voices || voices.length === 0) return null;

        const spanishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
        if (spanishVoices.length === 0) return null;

        const preferredKeywords = ['google', 'natural', 'online', 'wavenet', 'neural'];
        const preferred = spanishVoices.find(v =>
            preferredKeywords.some(k => v.name.toLowerCase().includes(k))
        );

        return preferred || spanishVoices[0];
    }

    speakPage() {
        if (!('speechSynthesis' in window)) return;

        const page = this.story.pages[this.pageIndex];
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(page.text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        const voice = this.pickBestSpanishVoice(window.speechSynthesis.getVoices());
        if (voice) utterance.voice = voice;

        utterance.onstart = () => {
            this.isNarrating = true;
            this.updateNarratorIcon(true);
        };

        utterance.onend = () => {
            const hasNextPage = this.pageIndex < this.story.pages.length - 1;

            if (this.autoAdvance && hasNextPage) {
                this.pageIndex++;
                this.renderPage();
                this.time.delayedCall(500, () => {
                    if (this.autoAdvance) this.speakPage();
                });
            } else {
                this.autoAdvance = false;
                this.isNarrating = false;
                this.updateNarratorIcon(false);
            }
        };

        utterance.onerror = () => {
            this.isNarrating = false;
            this.updateNarratorIcon(false);
        };

        window.speechSynthesis.speak(utterance);
    }

    stopNarration() {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        this.autoAdvance = false;
        this.isNarrating = false;
        this.updateNarratorIcon(false);
    }

    createBackButton() {
        const backBtn = this.add.image(80, 625, 'libro_boton')
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
            this.stopNarration();
            this.scene.start('Cuentos');
        });
    }
}