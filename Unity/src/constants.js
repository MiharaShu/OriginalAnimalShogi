
// --- Piece Type Identifiers ---
const TYPES = {
    LION: 'lion',
    GIRAFFE: 'giraffe',
    ELEPHANT: 'elephant',
    CHICK: 'chick',
    HEN: 'hen',
    RYUO: 'ryuo',
    KNIGHT: 'knight',
    GHOST_HEN: 'ghost_hen',
    LEOPARD: 'leopard',
    HAWK: 'hawk'
};

// --- Piece Definitions (movement rules, images, descriptions) ---
const PIECES = {
    [TYPES.LION]: { 
        nameJP: 'ライオン', 
        description: 'すべての方向に1マス動けます。相手の「一番奥の列」に到達すると勝ちです。自分のライオンが取られないように注意しましょう。', 
        image: '../assets/images/lion.webp', 
        moves: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] 
    },
    [TYPES.GIRAFFE]: { 
        nameJP: 'きりん', 
        description: '前後左右に1マスずつ動けます。斜めには動けません。', 
        image: '../assets/images/kirin.webp', 
        moves: [[0, -1], [-1, 0], [1, 0], [0, 1]] 
    },
    [TYPES.ELEPHANT]: { 
        nameJP: 'ぞう', 
        description: '斜め4方向に1マスずつ動けます。前後左右には動けません。', 
        image: '../assets/images/zou.webp', 
        moves: [[-1, -1], [1, -1], [-1, 1], [1, 1]] 
    },
    [TYPES.CHICK]: { 
        nameJP: 'ひよこ', 
        description: '前に1マスだけ動けます。相手の陣地の奥まで進むと、ニワトリに「成る」ことができます。', 
        image: '../assets/images/hiyo.webp', 
        moves: [[0, -1]] 
    },
    [TYPES.HEN]: { 
        nameJP: 'にわとり', 
        description: 'ひよこが「成った」姿。前、斜め前、左右、後ろの6方向に動けます。斜め後ろには動けません。', 
        image: '../assets/images/tikin.webp', 
        moves: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] 
    },
    [TYPES.RYUO]: { 
        nameJP: '竜王', 
        description: '斜め4方向に1マスずつ動ける上に、前後左右にはどこまででも進める強力な駒です。', 
        image: '../assets/images/ryuou.webp', 
        moves: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 
        sliding: [[0, -1], [0, 1], [-1, 0], [1, 0]] 
    },
    [TYPES.KNIGHT]: { 
        nameJP: 'ナイト', 
        description: '八方桂（L字型に離れた8マス）の動きに加えて、斜め4方向の1マスにも進める万能な駒です。', 
        image: '../assets/images/knight.webp', 
        moves: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        jumps: [[-1, -2], [1, -2], [-2, -1], [2, -1], [-2, 1], [2, 1], [-1, 2], [1, 2]] 
    },
    [TYPES.GHOST_HEN]: { 
        nameJP: '幽霊にわとり', 
        description: 'にわとりと同じ動きです。倒されても相手の「持ち駒」にならない特殊な体質を持っています。', 
        image: '../assets/images/ghosttikin.webp', 
        moves: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]], 
        ghost: true 
    },
    [TYPES.LEOPARD]: { 
        nameJP: '忍者ヒョウ', 
        description: '斜め4方向に1マス動けます。さらに、斜め2マス先に他の駒を飛び越えて着地する「奇襲」ジャンプが可能です。', 
        image: '../assets/images/ninja_leopard.webp', 
        moves: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 
        jumps: [[-2, -2], [2, -2], [-2, 2], [2, 2]] 
    },
    [TYPES.HAWK]: { 
        nameJP: 'タカ', 
        description: '前方に向かって、障害物がない限りどこまでも進めます。空からの急襲に最適です。', 
        image: '../assets/images/hawk.webp', 
        sliding: [[0, -1]] 
    }
};

// --- Piece Values (used by AI evaluation) ---
const PIECE_VALUES = {
    [TYPES.LION]: 10000,
    [TYPES.GIRAFFE]: 60,
    [TYPES.ELEPHANT]: 60,
    [TYPES.HEN]: 70,
    [TYPES.CHICK]: 20,
    [TYPES.RYUO]: 120,
    [TYPES.KNIGHT]: 80,
    [TYPES.GHOST_HEN]: 70,
    [TYPES.LEOPARD]: 90,
    [TYPES.HAWK]: 50
};
