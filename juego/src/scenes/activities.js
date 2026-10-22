export const activities = [
    {
        id: 'sopa2',
        title: 'Sopa',
        type: 'wordsearch',
        cover: 'Sopa',
        video: 'assets/Sopa/Sopa_Intro.mp4',
        words: [
            'ARDILLA', 'BUHO', 'CONEJO', 'ERIZO', 'LINTERNA', 'FLORES', 'LUCIERNAGA',
            'ZORRO', 'CIERVO', 'MARIPOSA', 'CASCADA', 'SENDERO', 'MUSGO', 'ARBOL',
            'RIO', 'SETA', 'NIDO', 'RAMA', 'HOJAS'
        ],
        wordsPerRound: 7
    },
    {
        id: 'completar1',
        title: 'Completa la Palabra',
        type: 'completeword',
        cover: 'completa',
        video: 'assets/Videos/Completa_Intro.mp4',
        words: ['LUNA', 'NAVE', 'MAGIA', 'BOSQUE', 'COHETE', 'ESTRELLA']
    },
    {
        id: 'unir1',
        title: 'Une Palabra e Imagen',
        type: 'matchimage',
        cover: 'Une',
        video: 'assets/Videos/Une_Intro.mp4',
        pairsPerRound: 4,
        pairs: [
            { word: 'LUNA', key: 'luna', image: 'assets/Une/btn_luna.png' },
            { word: 'CARRO', key: 'carro', image: 'assets/Une/btn_carro.png' },
            { word: 'ESTRELLA', key: 'estrella', image: 'assets/Une/btn_estrella.png' },
            { word: 'MOCHILA', key: 'mochila', image: 'assets/Une/btn_mochila.png' },
            { word: 'CONTROLES', key: 'control', image: 'assets/Une/btn_control.png' },
            { word: 'LIBRO', key: 'libro', image: 'assets/Une/btn_libro.png' },
            { word: 'BOSQUE', key: 'bosque', image: 'assets/Une/btn_bosque.png' },
            { word: 'AVION', key: 'avion', image: 'assets/Une/btn_avion.png' },
            { word: 'CASA', key: 'casa', image: 'assets/Une/btn_casa.png' },
            { word: 'PERRO', key: 'perro', image: 'assets/Une/btn_perro.png' },
            { word: 'COMPUTADORA', key: 'computadora', image: 'assets/Une/btn_computadora.png' },
            { word: 'GATO', key: 'gato', image: 'assets/Une/btn_gato.png' },
            { word: 'FLOR', key: 'flor', image: 'assets/Une/btn_flor.png' },
            { word: 'NAVE', key: 'nave', image: 'assets/Une/btn_nave.png' },
            { word: 'SOL', key: 'sol', image: 'assets/Une/btn_sol.png' },
            { word: 'BALON', key: 'balon', image: 'assets/Une/btn_balon.png' },
            { word: 'HELADO', key: 'helado', image: 'assets/Une/btn_helado.png' },
            { word: 'PAJARO', key: 'pajaro', image: 'assets/Une/btn_pajaro.png' }
        ]
    },
    {
        id: 'frases1',
        title: 'Rompecabezas de Frases',
        type: 'sentencepuzzle',
        cover: 'Arma',
        video: 'assets/Videos/Arma_Intro.mp4',
        sentences: [
            ['LA', 'NAVE', 'VUELA', 'ALTO'],
            ['LA', 'LUNA', 'BRILLA', 'DE', 'NOCHE'],
            ['ANA', 'JUEGA', 'EN', 'EL', 'BOSQUE'],
            ['KIRO', 'ES', 'GENIAL'],
            ['YO', 'SOY', 'UN','AVENTURERO']
        ]
    },
    {
        id: 'burbujas1',
        title: 'Burbujas de Letras',
        type: 'letterbubbles',
        cover: 'abc',
        video: 'assets/Videos/Abc_Intro.mp4',

        },
    {
        id: 'memorama1',
        title: 'Memorama de Letras',
        type: 'memory',
        cover: 'pareja',
        video: 'assets/Videos/Memorama_Intro.mp4'
    }
];