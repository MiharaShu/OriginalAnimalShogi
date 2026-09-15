let currentStage = 0; // 0, 1, 2
let storyState = 'intro'; // 'intro', 'win', 'lose', 'clear'
let currentIntroStep = 0; // 真ストーリー用イントロステップ

// --- Game State ---
let board = [];
let hands = { 1: [], 2: [] };
let currentPlayer = 1; // 1: bottom (moves up), 2: top (moves down)
let selectedPos = null; // {r, c}
let selectedHandIndex = null; // {player, index}
let validMoves = []; // array of {r, c}
let gameOver = false;
let winnerMessage = "";
let winnerPlayer = 0;
let gameMode = 'PvP'; // 'PvP', 'PvAI' (Free), 'Story', 'Tutorial'
let isAITurn = false; // Flag to prevent interactions during AI thinking

// --- Tutorial State ---
let currentTutorialStep = 0;
let tutorialExpectedMove = null; // {from: {r,c}, to: {r,c}}
let tutorialHighlightCells = []; // array of {r,c}
let tutorialHighlightPiece = null; // {r,c}
let allowAnyMove = false;

let availableHelpers = { 
    superChick: true, eradicate: true, phoenix: true,
    awaken: true, timeStop: true, reunion: true 
}; 
let helperActiveMode = null; // 'eradicate', 'phoenix', 'awaken', etc.
let gachaRewardPiece = null;
let aiTurnCount = 0; // AIのターン数をカウント（炎ブレス用）
let fireBreathWarning = false; // 炎ブレスの前兆フラグ
let burningSquares = []; // 炎ブレスエフェクト表示用
let isFireBreathPlaying = false; // 炎ブレス中フラグ（render()の二重描画防止）
let gachaStock = 0; // ガチャのストック数（最大3）
let isMidGameGacha = false; // 進行中の対局内でのガチャかどうか
let isTimeStopping = false; // 「神の砂時計」用
let isExtraTurn = false; // 追加ターン中フラグ

// --- New Features State ---
let playerHP = 100;
let endlessFloor = 1;
let equippedHelpers = ['superChick', 'eradicate', 'phoenix']; // Default deck
let puzzleId = 0;
let puzzleTargetMoves = 0;
let puzzleCurrentMoves = 0;

// --- Dynamic Board Size (Level 5 uses 3x5) ---
let boardRows = 4;
let boardCols = 3;
let lastLionPurgeWarning = false; // ラストライオン次元の裁き警告

