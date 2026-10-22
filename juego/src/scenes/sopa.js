import { activities } from './activities.js';
import { preloadStars, showResults, starsFromAccuracy } from '../stars.js';

const DIRECTIONS = [
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 1, dc: 0 },
    { dr: -1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: -1, dc: -1 }
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class SopaDeLetras extends Phaser.Scene {

    constructor() {
        super('SopaDeLetras');
    }

    init(data) {
        this.activityId = data.activityId;
        this.gridSize = 10;
        this.cellSize = 46;
        this.foundWords = new Set();
        this.score = 0;
        this.finished = false;
        this.mistakes = 0;
        this.elapsedMs = 0;
        this.timerPaused = false;
        this.timerBound = false;
    }

    preload() {
        this.load.image('background', 'assets/Sopa/fondo1.png');
        this.load.image('control', 'assets/Sopa/control.png');
        this.load.image('titulo', 'assets/Sopa/sopa_titulo.png')
        this.load.image('marco', 'assets/Sopa/sopa_marco.png')
        this.load.image('marco_palabras', 'assets/Sopa/palabras_marco.png')
        this.load.image('busca', 'assets/Sopa/SOPA_L.png')
        preloadStars(this);
    }

    create() {
        this.activity = activities.find(a => a.id === this.activityId);

        const wordPool = this.activity.words.map(w => w.toUpperCase());
        const roundSize = this.activity.wordsPerRound || wordPool.length;
        this.words = Phaser.Utils.Array.Shuffle([...wordPool]).slice(0, roundSize);

        this.cameras.main.fadeIn(400, 0, 0, 0);

        this.add.image(640, 360, 'background').setScale(0.16);

        this.add.image(640, 75, 'titulo').setScale(0.1)

        this.add.image(140, 500, 'busca').setScale(0.12)

        this.buildGrid();
        this.drawGrid();
        this.drawWordList();

        this.selectionGraphics = this.add.graphics();
        this.foundGraphics = this.add.graphics();

        this.isDragging = false;
        this.startCell = null;
        this.currentCell = null;

        this.setupInput();
        this.createBackButton();

        this.startTimer();
    }

    startTimer() {
        this.elapsedMs = 0;
        this.timerPaused = false;
        if (this.timerBound) return;
        this.timerBound = true;
        const pause = () => { this.timerPaused = true; };
        const resume = () => { this.timerPaused = false; };
        this.game.events.on('blur', pause);
        this.game.events.on('hidden', pause);
        this.game.events.on('focus', resume);
        this.game.events.on('visible', resume);
        this.events.once('shutdown', () => {
            this.timerBound = false;
            this.game.events.off('blur', pause);
            this.game.events.off('hidden', pause);
            this.game.events.off('focus', resume);
            this.game.events.off('visible', resume);
        });
    }

    update(time, delta) {
        if (this.finished || !this.timerText || this.timerPaused) return;

        this.elapsedMs += Math.min(delta, 250);
        this.timerText.setText(this.formatTime(this.elapsedMs));
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    buildGrid() {
        const size = this.gridSize;
        this.grid = Array.from({ length: size }, () => Array(size).fill(null));
        this.placements = [];

        const sortedWords = [...this.words].sort((a, b) => b.length - a.length);
        sortedWords.forEach(word => this.placeWord(word));

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!this.grid[r][c]) {
                    this.grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                }
            }
        }
    }

    placeWord(word) {
        const size = this.gridSize;
        const maxAttempts = 9999;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);

            const endRow = row + dir.dr * (word.length - 1);
            const endCol = col + dir.dc * (word.length - 1);
            if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

            let fits = true;
            const cells = [];
            for (let i = 0; i < word.length; i++) {
                const r = row + dir.dr * i;
                const c = col + dir.dc * i;
                const existing = this.grid[r][c];
                if (existing && existing !== word[i]) {
                    fits = false;
                    break;
                }
                cells.push({ row: r, col: c });
            }

            if (fits) {
                cells.forEach((cell, i) => { this.grid[cell.row][cell.col] = word[i]; });
                this.placements.push({ word, cells });
                return true;
            }
        }

        console.warn(`No se pudo colocar la palabra: ${word}`);
        return false;
    }

    drawGrid() {
        const size = this.gridSize;
        this.originX = 600 - (size * this.cellSize) / 2 - 80;
        this.originY = 150;

        this.add.image(680, 385, 'marco').setScale(0.18)

        const panel = this.add.graphics();
        panel.fillStyle(0x1b1b2f, 0.88);
        panel.lineStyle(3, 0xffffff, 0.25);

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const x = this.originX + c * this.cellSize + this.cellSize / 2;
                const y = this.originY + r * this.cellSize + this.cellSize / 2;

                this.add.text(x, y, this.grid[r][c], {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    color: '#000000'
                }).setOrigin(0.5);
            }
        }
    }

    drawWordList() {
        const startX = this.originX + this.gridSize * this.cellSize + 80    ;
        const spacing = 34;
        const panelPadding = 20;

        const panelTop = 120;
        const timeLabelY = panelTop + 75;
        const timeValueY = panelTop + 95;
        const scoreLabelY = panelTop + 125;
        const scoreValueY = panelTop + 145;
        const listTitleY = panelTop + 182;
        const listStartY = panelTop + 212;

        const panelBottom = listStartY + this.words.length * spacing + panelPadding;

        this.add.image(920, 380 , 'marco_palabras').setScale(0.18)

        this.add.text(startX, timeLabelY, 'Tiempo', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#000000'
        });
        this.timerText = this.add.text(startX, timeValueY, '0:00', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#000000',
            fontStyle: 'bold'
        });

        this.add.text(startX, scoreLabelY, 'Puntos', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#000000'
        });
        this.scoreText = this.add.text(startX, scoreValueY, '0', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#000000',
            fontStyle: 'bold'
        });

        this.add.text(startX, listTitleY, 'Encuentra:', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#000000',
            fontStyle: 'bold'
        });

        this.wordListTexts = {};

        this.words.forEach((word, index) => {
            const text = this.add.text(startX, listStartY + index * spacing, word, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#000000'
            });
            this.wordListTexts[word] = text;
        });

        this.winText = this.add.text(640, 660, '', {
            fontFamily: 'Arial',
            fontSize: '26px',
            color: '#335e089f',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            const cell = this.pointToCell(pointer.worldX, pointer.worldY);
            if (cell) {
                this.isDragging = true;
                this.startCell = cell;
                this.currentCell = cell;
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;
            const cell = this.pointToCell(pointer.worldX, pointer.worldY);
            if (cell) {
                this.currentCell = this.snapToLine(this.startCell, cell);
                this.drawSelection();
            }
        });

        this.input.on('pointerup', () => {
            if (this.isDragging) this.checkSelection();
            this.isDragging = false;
            this.selectionGraphics.clear();
        });
    }

    gamepadDpad(dx, dy, cursor) {
        const size = this.gridSize;
        const inside = this.pointToCell(cursor.x, cursor.y);
        const cell = inside || {
            row: Phaser.Math.Clamp(Math.floor((cursor.y - this.originY) / this.cellSize), 0, size - 1),
            col: Phaser.Math.Clamp(Math.floor((cursor.x - this.originX) / this.cellSize), 0, size - 1)
        };

        if (!inside) return this.cellToPoint(cell);

        const row = cell.row + dy;
        const col = cell.col + dx;
        if (row < 0 || row >= size || col < 0 || col >= size) return null;
        return this.cellToPoint({ row, col });
    }

    pointToCell(x, y) {
        const size = this.gridSize;
        const col = Math.floor((x - this.originX) / this.cellSize);
        const row = Math.floor((y - this.originY) / this.cellSize);
        if (row < 0 || row >= size || col < 0 || col >= size) return null;
        return { row, col };
    }

    snapToLine(start, target) {
        const dRow = target.row - start.row;
        const dCol = target.col - start.col;
        if (dRow === 0 && dCol === 0) return start;

        const length = Math.sqrt(dRow * dRow + dCol * dCol);
        const normRow = dRow / length;
        const normCol = dCol / length;

        let bestDir = DIRECTIONS[0];
        let bestDot = -Infinity;
        DIRECTIONS.forEach(d => {
            const dLen = Math.sqrt(d.dr * d.dr + d.dc * d.dc);
            const dot = (normRow * d.dr / dLen) + (normCol * d.dc / dLen);
            if (dot > bestDot) { bestDot = dot; bestDir = d; }
        });

        const distance = Math.max(Math.abs(dRow), Math.abs(dCol));
        const size = this.gridSize;

        return {
            row: Phaser.Math.Clamp(start.row + bestDir.dr * distance, 0, size - 1),
            col: Phaser.Math.Clamp(start.col + bestDir.dc * distance, 0, size - 1)
        };
    }

    getLineCells(start, end) {
        const dRow = end.row - start.row;
        const dCol = end.col - start.col;
        const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
        if (steps === 0) return [start];

        const stepRow = dRow / steps;
        const stepCol = dCol / steps;

        const cells = [];
        for (let i = 0; i <= steps; i++) {
            cells.push({
                row: start.row + Math.round(stepRow * i),
                col: start.col + Math.round(stepCol * i)
            });
        }
        return cells;
    }

    drawSelection() {
        this.selectionGraphics.clear();
        if (!this.startCell || !this.currentCell) return;

        const startPos = this.cellToPoint(this.startCell);
        const endPos = this.cellToPoint(this.currentCell);
        const radius = (this.cellSize * 0.7) / 2;

        this.selectionGraphics.lineStyle(this.cellSize * 0.7, 0xffdd55, 0.5);
        this.selectionGraphics.beginPath();
        this.selectionGraphics.moveTo(startPos.x, startPos.y);
        this.selectionGraphics.lineTo(endPos.x, endPos.y);
        this.selectionGraphics.strokePath();

        this.selectionGraphics.fillStyle(0xffdd55, 0.5);
        this.selectionGraphics.fillCircle(startPos.x, startPos.y, radius);
        this.selectionGraphics.fillCircle(endPos.x, endPos.y, radius);
    }

    cellToPoint(cell) {
        return {
            x: this.originX + cell.col * this.cellSize + this.cellSize / 2,
            y: this.originY + cell.row * this.cellSize + this.cellSize / 2
        };
    }

    checkSelection() {
        if (!this.startCell || !this.currentCell) return;

        const cells = this.getLineCells(this.startCell, this.currentCell);
        const forward = cells.map(c => this.grid[c.row][c.col]).join('');
        const backward = [...forward].reverse().join('');

        const match = this.placements.find(p =>
            !this.foundWords.has(p.word) &&
            (p.word === forward || p.word === backward) &&
            this.sameCells(p.cells, cells)
        );

        if (match) this.markWordFound(match);
        else if (cells.length > 1) this.mistakes++;
    }

    sameCells(cellsA, cellsB) {
        if (cellsA.length !== cellsB.length) return false;
        const setA = new Set(cellsA.map(c => `${c.row},${c.col}`));
        const setB = new Set(cellsB.map(c => `${c.row},${c.col}`));
        if (setA.size !== setB.size) return false;
        for (const key of setA) {
            if (!setB.has(key)) return false;
        }
        return true;
    }

    markWordFound(placement) {
        this.foundWords.add(placement.word);

        const startPos = this.cellToPoint(placement.cells[0]);
        const endPos = this.cellToPoint(placement.cells[placement.cells.length - 1]);
        const radius = (this.cellSize * 0.7) / 2;

        this.foundGraphics.lineStyle(this.cellSize * 0.7, 0x4caf50, 0.5);
        this.foundGraphics.beginPath();
        this.foundGraphics.moveTo(startPos.x, startPos.y);
        this.foundGraphics.lineTo(endPos.x, endPos.y);
        this.foundGraphics.strokePath();

        this.foundGraphics.fillStyle(0x4caf50, 0.5);
        this.foundGraphics.fillCircle(startPos.x, startPos.y, radius);
        this.foundGraphics.fillCircle(endPos.x, endPos.y, radius);

        const text = this.wordListTexts[placement.word];
        text.setColor('#33580d');
        text.setFontStyle('italic');
        text.setText(`✓ ${placement.word}`);

        this.score += 100;
        this.scoreText.setText(this.score.toString());

        if (this.foundWords.size === this.words.length) {
            this.finished = true;
            this.time.delayedCall(700, () => showResults(this, {
                stars: starsFromAccuracy(this.words.length, this.mistakes),
                score: this.score,
                detail: `Tiempo ${this.timerText.text} · ${this.mistakes} ${this.mistakes === 1 ? 'intento fallido' : 'intentos fallidos'}`
            }));
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