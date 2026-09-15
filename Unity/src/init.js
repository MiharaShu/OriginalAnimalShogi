// --- Game Initialization ---
// ゲーム盤面・状態のリセットと初期盤面の配置を管理します

function startStoryBattle() {
    // 修正: TrueStoryでは全体通して各1回のみの仕様に戻すため、最初のステージ(0)でのみリセットする
    if (gameMode !== 'TrueStory' || currentStage === 0) {
        availableHelpers = {
            superChick: false, eradicate: false, phoenix: false,
            awaken: false, timeStop: false, reunion: false
        };
        equippedHelpers.forEach(h => {
            availableHelpers[h] = true;
        });
    }

    hideAllScreens();
    document.getElementById('gameContainer').style.display = 'flex';
    initGame();
}

function initGame() {
    // バグ修正: 対局間でtranspositionTableが溜まりメモリリーク・誤判定を防ぐ
    if (typeof transpositionTable !== 'undefined') {
        transpositionTable.clear();
        nodesVisited = 0;
    }
    // Reset board dimensions (default 4x3, Level 5 uses 5x3)
    boardRows = 4;
    boardCols = 3;
    if (gameMode === 'TrueStory' && currentStage === 4) {
        boardRows = 5;
        boardCols = 3;
    }
    board = Array(boardRows).fill(null).map(() => Array(boardCols).fill(null));
    hands = { 1: [], 2: [] };
    currentPlayer = 1;
    selectedPos = null;
    selectedHandIndex = null;
    validMoves = [];
    gameOver = false;
    winnerMessage = '';
    winnerPlayer = 0;
    isAITurn = false;
    fireBreathWarning = false;
    burningSquares = [];
    aiTurnCount = 0;
    lastLionPurgeWarning = false;
    helperActiveMode = null;
    isTimeStopping = false;
    isExtraTurn = false;

    // Initialize available helpers from equipped selection for Non-Story modes
    if (gameMode !== 'Story' && gameMode !== 'TrueStory') {
        availableHelpers = { 
            superChick: false, eradicate: false, phoenix: false,
            awaken: false, timeStop: false, reunion: false 
        };
        equippedHelpers.forEach(h => {
            availableHelpers[h] = true;
        });
    }

    // --- Player 2 (Top - moves down) 初期配置 ---
    board[0][0] = { type: TYPES.GIRAFFE, player: 2 };
    board[0][1] = { type: TYPES.LION, player: 2 };
    board[0][2] = { type: TYPES.ELEPHANT, player: 2 };
    board[1][1] = { type: TYPES.CHICK, player: 2 };

    // --- Story Mode difficulty adjustments ---
    if (gameMode === 'Story') {
        if (currentStage === 0) {
            // Level 1: Remove Elephant
            board[0][2] = null;
        } else if (currentStage === 1) {
            // Level 2: Giraffe -> Elephant
            board[0][0] = { type: TYPES.ELEPHANT, player: 2 };
        } else if (currentStage === 2) {
            // Level 3: AI starts with Chick in hand
            hands[2].push(TYPES.CHICK);
            currentPlayer = 2; // AI goes first
        } else if (currentStage === 3) {
            // Level 4: AI starts with Elephant in hand
            hands[2].push(TYPES.ELEPHANT);
        }
    } else if (gameMode === 'TrueStory') {
        // True Story special board setups
        if (currentStage === 1) { // ダークフェニックス男
            board[0][1].isDarkLion = true;
        } else if (currentStage === 2) { // 真フェニックス男
            board[0][1].isPhoenixLion = true;
            board[0][1].hasRevived = false;
        } else if (currentStage === 3) { // デンセツノキシ
            board[0][0] = { type: TYPES.RYUO, player: 2 };
            board[0][2] = { type: TYPES.KNIGHT, player: 2 };
            board[1][1] = { type: TYPES.GHOST_HEN, player: 2 };
            board[0][1].isDarkLion = true;
            board[0][1].isPhoenixLion = true;
            board[0][1].hasRevived = false;
        } else if (currentStage === 4) { // ラストライオン（真レベル5）
            // 特殊 3x5 盤面: ラストライオンは中央 (row 1, col 1)
            // 盤面を完全リセット（5x3）
            board = Array(5).fill(null).map(() => Array(3).fill(null));
            
            // ラストライオン: 中央上部 (row 1, col 1) にライオン配置
            board[1][1] = { type: TYPES.LION, player: 2, isLastLion: true };
            
            // ラストライオンの周囲すべてに幽霊にわとりを配置
            const lastLionR = 1, lastLionC = 1;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue; // ラストライオン自身はスキップ
                    const nr = lastLionR + dr;
                    const nc = lastLionC + dc;
                    if (nr >= 0 && nr < 5 && nc >= 0 && nc < 3) {
                        board[nr][nc] = { type: TYPES.GHOST_HEN, player: 2 };
                    }
                }
            }
            
            // 全特殊能力を解放（各1回ずつ）
            availableHelpers = {
                superChick: true, eradicate: true, phoenix: true,
                awaken: true, timeStop: true, reunion: true
            };
            equippedHelpers = ['superChick', 'eradicate', 'phoenix', 'awaken', 'timeStop', 'reunion'];
            
            // ガチャを最大回数までチャージ
            gachaStock = 5;
        }
    } else if (gameMode === 'Endless') {
        const enemy = generateEndlessEnemy(endlessFloor);
        document.getElementById('storyEnemyName').textContent = enemy.name;
    }

    // --- Player 1 (Bottom - moves up) 初期配置 ---
    const bottomRow = boardRows - 1;
    const chickRow = boardRows - 2;
    board[bottomRow][0] = { type: TYPES.ELEPHANT, player: 1 };
    board[bottomRow][1] = { type: TYPES.LION, player: 1 };
    board[bottomRow][2] = { type: TYPES.GIRAFFE, player: 1 };
    board[chickRow][1] = { type: TYPES.CHICK, player: 1 };

    // ガチャ報酬を反映
    if (gachaRewardPiece) {
        hands[1].push(gachaRewardPiece);
        gachaRewardPiece = null; // 使用済み
    }

    render();

    render();

    // --- Start BGM ---
    if (gameMode !== 'Tutorial' && typeof AudioEngine !== 'undefined' && typeof AudioEngine.playBGM === 'function') {
        AudioEngine.playBGM();
    }

    // Tutorial override: let runTutorialStep handle board setup
    if (gameMode === 'Tutorial') {
        return;
    }

    // Trigger AI turn if AI is set to go first
    if (currentPlayer === 2 && (gameMode === 'PvAI' || gameMode === 'Story' || gameMode === 'TrueStory') && !gameOver) {
        isAITurn = true;
        render();
        setTimeout(() => {
            executeAIMove();
        }, 200);
    }
}

// --- Application Entry Point ---
showTitleScreen();
