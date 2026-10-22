import { stories } from './stories.js';
import { quizzes } from './quizzes.js';
import { preloadStars, showResults } from '../stars.js';
import { COLORS, preloadUI, makePanel, setPanel } from '../ui.js';

export class Preguntas extends Phaser.Scene {

    constructor() {
        super('Preguntas');
    }

    init(data) {
        this.storyId = data.storyId;
        this.story = stories.find(s => s.id === this.storyId);
        this.questions = Phaser.Utils.Array.Shuffle([...(quizzes[this.storyId] || [])]);
        this.index = 0;
        this.correctCount = 0;
        this.locked = false;
    }

    preload() {
        this.load.image('libro_boton', 'assets/Cuentos/libro_boton.png');
        preloadUI(this, ['ficha', 'ficha_ok', 'casilla_error', 'panel_puntos', 'panel_final']);
        preloadStars(this);
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);
        if (this.textures.exists('background')) this.add.image(640, 360, 'background').setScale(0.16);

        if (this.questions.length === 0) {
            this.createBackButton();
            this.finish();
            return;
        }

        this.add.text(640, 55, 'Comprueba tu lectura', {
            fontFamily: 'Arial', fontSize: '40px', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(640, 98, this.story.title, {
            fontFamily: 'Arial', fontSize: '22px', color: '#512BD4', fontStyle: 'bold'
        }).setOrigin(0.5);

        makePanel(this, 'panel_puntos', 200, 60, 1130, 52);
        this.progressText = this.add.text(1130, 52, '', {
            fontFamily: 'Arial', fontSize: '22px', color: '#ffdd55', fontStyle: 'bold'
        }).setOrigin(0.5);

        makePanel(this, 'panel_final', 900, 130, 640, 190);
        this.questionText = this.add.text(640, 190, '', {
            fontFamily: 'Arial', fontSize: '34px', color: COLORS.ink, fontStyle: 'bold',
            align: 'center', wordWrap: { width: 820 }
        }).setOrigin(0.5);

        this.feedbackText = this.add.text(640, 622, '', {
            fontFamily: 'Arial', fontSize: '28px', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.optionContainer = this.add.container(0, 0);
        this.createBackButton();
        this.showQuestion();
    }

    showQuestion() {
        const q = this.questions[this.index];
        this.locked = false;
        this.feedbackText.setText('');
        this.progressText.setText(`Pregunta ${this.index + 1} / ${this.questions.length}`);
        this.questionText.setText(q.q);

        this.optionContainer.removeAll(true);
        const options = Phaser.Utils.Array.Shuffle([q.correct, ...q.wrong]);
        const width = 700, height = 72, gap = 22, startY = 340;

        options.forEach((text, i) => {
            const y = startY + i * (height + gap);
            const holder = this.add.container(0, 0);
            holder.add(makePanel(this, 'ficha', width, height));

            const label = this.add.text(0, 0, text, {
                fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);

            const option = this.add.container(640, y, [holder, label]);
            option.setSize(width, height);
            option.setInteractive({ useHandCursor: true });
            option.on('pointerover', () => { if (!this.locked) this.tweens.add({ targets: option, scale: 1.04, duration: 100 }); });
            option.on('pointerout', () => this.tweens.add({ targets: option, scale: 1, duration: 100 }));
            option.on('pointerdown', () => this.choose(option, holder, label, text === q.correct, options, q));

            option.setData('isCorrect', text === q.correct);
            option.holder = holder;
            option.label = label;
            this.optionContainer.add(option);
        });
    }

    choose(option, holder, label, isCorrect) {
        if (this.locked) return;
        this.locked = true;

        this.optionContainer.list.forEach(o => {
            o.disableInteractive();
            if (o.getData('isCorrect')) setPanel(this, o.holder, 'ficha_ok', 700, 72);
        });

        if (isCorrect) {
            this.correctCount++;
            this.feedbackText.setColor('#2e7d32').setText('¡Correcto! 🎉');
            this.tweens.add({ targets: option, scale: 1.06, duration: 140, yoyo: true });
        } else {
            setPanel(this, holder, 'casilla_error', 700, 72);
            label.setColor(COLORS.ink);
            this.feedbackText.setColor('#c92a2a').setText('Esa no era. La respuesta correcta está en verde.');
            this.tweens.add({ targets: option, x: option.x + 8, duration: 50, yoyo: true, repeat: 3 });
        }

        this.time.delayedCall(1500, () => {
            this.index++;
            if (this.index >= this.questions.length) this.finish();
            else this.showQuestion();
        });
    }

    finish() {
        const total = this.questions.length;
        const stars = this.correctCount >= total ? 3 : this.correctCount === total - 1 ? 2 : 1;
        if (this.optionContainer) this.optionContainer.removeAll(true);

        showResults(this, {
            id: 'story:' + this.storyId,
            stars,
            score: this.correctCount * 100,
            detail: total ? `${this.correctCount} de ${total} respuestas correctas` : 'Cuento leído',
            retryImage: 'btn_leer_otra',
            menuImage: 'btn_cuentos',
            onRetry: () => this.scene.start('CuentaCuentos', { storyId: this.storyId }),
            onMenu: () => this.scene.start('Cuentos'),
        });
    }

    createBackButton() {
        const backBtn = this.add.image(80, 625, 'libro_boton')
            .setDisplaySize(100, 100)
            .setInteractive({ useHandCursor: true });
        this.backButton = backBtn;
        const baseScale = backBtn.scaleX;

        backBtn.on('pointerover', () => this.tweens.add({ targets: backBtn, scale: baseScale * 1.15, duration: 120 }));
        backBtn.on('pointerout', () => this.tweens.add({ targets: backBtn, scale: baseScale, duration: 120 }));

        backBtn.on('pointerdown', () => this.scene.start('CuentaCuentos', { storyId: this.storyId }));
    }
}
