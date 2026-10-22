import {musica} from './musica.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('Pre', 'assets/space.png');
        this.load.image('background', 'assets/Menu/fondo1.png');
        this.load.image('logo', 'assets/Menu/kiro.png');
        this.load.spritesheet('boom', 'assets/Boom.png', { frameWidth: 960, frameHeight: 960 });
        this.load.spritesheet('ship', 'assets/Vuelo.png', { frameWidth: 176, frameHeight: 96 });
        this.load.image('btnCuentos', 'assets/Menu/btncuentos.png');
        this.load.image('btnActividades', 'assets/Menu/btnactividad.png');
        this.load.image('titulo_Menu', 'assets/Menu/menu_T.png');

        musica.preloadTracks(this);
    }

    create() {
        if (!this.game.musica) {
            this.game.musica = new musica(this.game);
        }
        this.game.musica.startPlaylist(this);

        this.background = this.add.image(640, 360, 'Pre');

        const ship = this.add.sprite(100, 360, 'ship');

        ship.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });
        ship.play('fly');
        this.anims.create({
            key: 'boom',
            frames: this.anims.generateFrameNumbers('boom', { start: 0, end: 6 }),
            frameRate: 20,
            repeat: 0
        });

        this.tweens.add({
            targets: ship,
            x: 1200,
            duration: 3000,
            ease: 'Power1',
            onComplete: () => {
                ship.destroy();

                const boom = this.add.sprite(1200, 360, 'boom').setScale(0.15);
                boom.play('boom');

                this.cameras.main.shake(300, 0.02);

                boom.on('animationcomplete', () => {
                    boom.destroy();

                    this.cameras.main.flash(300, 255, 255, 255);

                    this.time.delayedCall(250, () => {
                        this.cameras.main.fadeOut(600, 0, 0, 0);
                    });

                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('Menu');
                    });
                });
            }
        });
    }
}