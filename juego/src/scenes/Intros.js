import { activities } from './activities.js';

export class Intros extends Phaser.Scene {
    constructor() {
        super('Intros');
    }

    init(data) {
        this.targetScene = data.targetScene;
        this.activityId = data.activityId;
        this.activity = activities.find(a => a.id === this.activityId);
    }

    preload() {
        this.videoKey = 'introVideo_' + this.activityId;
        this.videoFailed = false;
        this.load.on('loaderror', (file) => {
            if (file.key === this.videoKey) this.videoFailed = true;
        });
        try {
            this.load.video(this.videoKey, this.activity.video);
        } catch (error) {
            this.videoFailed = true;
        }
        this.load.image('btnFlecha', 'assets/right.png');
    }

    create() {
        if (this.videoFailed || !this.cache.video.exists(this.videoKey)) {
            this.scene.start(this.targetScene, { activityId: this.activityId });
            return;
        }

        this.cameras.main.clearBeforeRender = false;
        this.add.image(640, 360, 'background').setScale(0.16);
        this.scene.launch(this.targetScene, { activityId: this.activityId });
        this.scene.bringToTop();

        const targetInstance = this.scene.get(this.targetScene);

        const applyBlurAndPause = () => {
            if (targetInstance.cameras && targetInstance.cameras.main.postFX) {
                targetInstance.cameras.main.postFX.clear();
                targetInstance.cameras.main.postFX.addBlur(1, 2, 2, 1);
            }
            this.scene.pause(this.targetScene);
            if (targetInstance.input) {
                targetInstance.input.enabled = false;
            }
        };

        targetInstance.events.once(Phaser.Scenes.Events.CREATE, applyBlurAndPause);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.4);
        overlay.fillRect(0, 0, 1280, 720);

        const videoWidth = 640;
        const videoHeight = 360;
        const videoY = 220;

        const frame = this.add.graphics();
        frame.lineStyle(4, 0xffdd55, 1);
        frame.strokeRoundedRect(
            640 - videoWidth / 2 - 6,
            videoY - videoHeight / 2 - 6,
            videoWidth + 12,
            videoHeight + 12,
            16
        );

        this.video = this.add.video(640, videoY, this.videoKey);
        this.video.setDisplaySize(videoWidth, videoHeight);

        this.video.once('play', () => {
            this.video.setDisplaySize(videoWidth, videoHeight);
        });

        this.video.play(false);
        this.video.setDisplaySize(videoWidth, videoHeight);

        this.video.on('complete', () => {
            this.startActivity();
        });

        const skipBtn = this.add.image(640, 445, 'btnFlecha')
            .setDisplaySize(70, 70)
            .setInteractive({ useHandCursor: true });

        this.backButton = skipBtn;

        this.add.text(640, 495, 'SALTAR ➔', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        skipBtn.on('pointerover', () => {
            this.tweens.add({ targets: skipBtn, scaleX: skipBtn.scaleX * 1.15, scaleY: skipBtn.scaleY * 1.15, duration: 100 });
        });
        skipBtn.on('pointerout', () => {
            this.tweens.add({ targets: skipBtn, scaleX: skipBtn.scaleX / 1.15, scaleY: skipBtn.scaleY / 1.15, duration: 100 });
        });
        skipBtn.on('pointerdown', () => {
            this.startActivity();
        });
    }

    startActivity() {
        if (this.video) {
            this.video.stop();
            this.video.destroy();
        }

        const targetInstance = this.scene.get(this.targetScene);
        if (targetInstance) {
            if (targetInstance.cameras && targetInstance.cameras.main.postFX) {
                targetInstance.cameras.main.postFX.clear();
            }
            if (targetInstance.input) {
                targetInstance.input.enabled = true;
            }
            if (typeof targetInstance.startTimer === 'function') {
                targetInstance.startTimer();
            }
        }

        this.scene.resume(this.targetScene);
        this.scene.stop();
    }
}