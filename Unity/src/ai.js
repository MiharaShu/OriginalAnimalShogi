let nodesVisited = 0;
const transpositionTable = new Map();

function getBoardHash() {
    let hash = "";
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            const p = board[r][c];
            if (!p) hash += "0";
            else hash += p.player + p.type;
        }
    }
    // Efficient hand hashing without sorting every time
    hash += "-H1:" + hands[1].join("") + "-H2:" + hands[2].join("");
    hash += "-" + currentPlayer;
    return hash;
}

function evaluateBoard() {
    // Player 2 (AI) is maximizing, Player 1 (Human) is minimizing
    let score = 0;

    // Evaluate board pieces
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            const piece = board[r][c];
            if (piece) {
                let value = PIECE_VALUES[piece.type];

                // Position bonuses
                if (piece.type === TYPES.LION) {
                    if (piece.player === 2) {
                        value += r * 20; // AI wants to reach r=boardRows-1
                    } else {
                        value += (boardRows - 1 - r) * 20; // Human wants to reach r=0
                    }
                } else if (piece.type === TYPES.CHICK) {
                    // Advancement bonus for Chick
                    if (piece.player === 2) value += r * 5;
                    else value += (boardRows - 1 - r) * 5;
                }

                // Center control
                if (c === 1) value += 5;

                score += piece.player === 2 ? value : -value;
            }
        }
    }

    // Evaluate hands (hand pieces are flexible)
    hands[2].forEach(type => score += PIECE_VALUES[type] * 1.2);
    hands[1].forEach(type => score -= PIECE_VALUES[type] * 1.2);

    return score;
}

function minimax(depth, alpha, beta, isMaximizingPlayer) {
    nodesVisited++;

    // Check Transposition Table
    const hash = getBoardHash();
    if (transpositionTable.has(hash)) {
        const entry = transpositionTable.get(hash);
        if (entry.depth >= depth) {
            return entry.score;
        }
    }

    // Win/Loss Condition Check
    let lion1 = false, lion2 = false;
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            if (board[r][c]?.type === TYPES.LION) {
                if (board[r][c].player === 1) lion1 = true;
                if (board[r][c].player === 2) lion2 = true;

                // Try winning check (Safe from capture)
                if (board[r][c].player === 1 && r === 0) {
                    if (!isSquareUnderAttack(r, c, 2)) return -20000 - depth;
                }
                if (board[r][c].player === 2 && r === boardRows - 1) {
                    if (!isSquareUnderAttack(r, c, 1)) return 20000 + depth;
                }
            }
        }
    }
    if (!lion1) return 20000 + depth; // Player 2 won by capturing
    if (!lion2) return -20000 - depth; // Player 1 won

    if (depth === 0) {
        return evaluateBoard();
    }

    const currentPlayerCalc = isMaximizingPlayer ? 2 : 1;
    const moves = getAllPossibleMoveWithScores(currentPlayerCalc);

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of moves) {
            const undoInfo = applyMoveTemporarily(move, 2);
            const evalScore = minimax(depth - 1, alpha, beta, false);
            undoMoveTemporarily(undoInfo, 2);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break; // Beta cut-off
        }
        transpositionTable.set(hash, { depth, score: maxEval });
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of moves) {
            const undoInfo = applyMoveTemporarily(move, 1);
            const evalScore = minimax(depth - 1, alpha, beta, true);
            undoMoveTemporarily(undoInfo, 1);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break; // Alpha cut-off
        }
        transpositionTable.set(hash, { depth, score: minEval });
        return minEval;
    }
}

function executeAIMove() {
    if (gameOver) return;
    aiTurnCount++;

    // --- 闇のライオン・火炎放射（TrueStory Stage 1/3）の特殊ギミック ---
    if (gameMode === 'TrueStory') {
        let darkLionCol = -1;
        let darkLionPos = { r: -1, c: -1 };
        for (let r = 0; r < boardRows; r++) {
            for (let c = 0; c < boardCols; c++) {
                if (board[r][c] && board[r][c].player === 2 && board[r][c].isDarkLion) {
                    darkLionCol = c;
                    darkLionPos = { r, c };
                    break;
                }
            }
            if (darkLionCol !== -1) break;
        }

        if (darkLionCol !== -1) {
            // 4ターンごとに火炎放射（4, 8, 12, 16...）
            if (aiTurnCount % 4 === 0 && aiTurnCount > 0) {
                burningSquares = [];
                // 1. ライオンと同じ縦列
                for (let r = 0; r < boardRows; r++) {
                    burningSquares.push({ r, c: darkLionCol });
                }
                // 2. ライオン周囲8マス（重複排除）
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = darkLionPos.r + dr;
                        const nc = darkLionPos.c + dc;
                        if (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                            if (!burningSquares.some(s => s.r === nr && s.c === nc)) {
                                burningSquares.push({ r: nr, c: nc });
                            }
                        }
                    }
                }

                isFireBreathPlaying = true;
                render();
                // バグ修正: tutorialOverlay の誤用排除 → showBoardMessage に統一
                if (currentStage === 3) {
                    showBoardMessage('☖ デンセツノキシ「この手はよめますか？」', 1000);
                } else {
                    showBoardMessage('🔥 ダークフェニックス男「焼き尽くしてやる……！」', 1000);
                }

                setTimeout(() => {
                    let lostLion = false;
                    burningSquares.forEach(sq => {
                        const targetPiece = board[sq.r][sq.c];
                        if (targetPiece && targetPiece.player === 1) {
                            if (targetPiece.type === TYPES.LION) lostLion = true;
                            board[sq.r][sq.c] = null;
                        }
                    });

                    burningSquares = [];
                    isFireBreathPlaying = false;

                    if (lostLion) {
                        gameOver = true;
                        winnerPlayer = 2;
                        winnerMessage = '火炎放射によりライオンが消滅しました...敗北です！';
                        render();
                        setTimeout(() => {
                            storyState = 'lose';
                            showStoryScreen();
                        }, 2000);
                    } else {
                        switchTurn();
                        render();
                    }
                }, 1000);

                return;
            }
        }
    }

    // --- ラストライオン: 次元の裁き（TrueStory Stage 4）---
    if (gameMode === 'TrueStory' && currentStage === 4) {
        let lastLionPos = null;
        for (let r = 0; r < boardRows; r++) {
            for (let c = 0; c < boardCols; c++) {
                if (board[r][c] && board[r][c].player === 2 && board[r][c].isLastLion) {
                    lastLionPos = { r, c };
                    break;
                }
            }
            if (lastLionPos) break;
        }

        if (lastLionPos && aiTurnCount % 3 === 0 && aiTurnCount > 0) {
            // 次元の裁き発動: ラストライオンの列と行の味方ゴマをすべて除去
            burningSquares = [];
            // 同じ行のすべてのマス
            for (let c = 0; c < boardCols; c++) {
                burningSquares.push({ r: lastLionPos.r, c });
            }
            // 同じ列のすべてのマス（重複排除）
            for (let r = 0; r < boardRows; r++) {
                if (!burningSquares.some(s => s.r === r && s.c === lastLionPos.c)) {
                    burningSquares.push({ r, c: lastLionPos.c });
                }
            }

            isFireBreathPlaying = true;
            render();
            showBoardMessage('⚡ ラストライオン「次元の裁きを受けよ……！」', 1200);

            setTimeout(() => {
                let lostLion = false;
                burningSquares.forEach(sq => {
                    const targetPiece = board[sq.r][sq.c];
                    if (targetPiece && targetPiece.player === 1) {
                        if (targetPiece.type === TYPES.LION) lostLion = true;
                        board[sq.r][sq.c] = null;
                    }
                });

                burningSquares = [];
                isFireBreathPlaying = false;
                lastLionPurgeWarning = false;

                if (lostLion) {
                    gameOver = true;
                    winnerPlayer = 2;
                    winnerMessage = '次元の裁きによりライオンが消滅しました...敗北です！';
                    render();
                    setTimeout(() => {
                        storyState = 'lose';
                        showStoryScreen();
                    }, 2000);
                } else {
                    switchTurn();
                    render();
                }
            }, 1200);

            return;
        }
    }

    // ----------------------------------------------------

    // Get Current AI Settings
    let searchDepth = 3;
    let randomChance = 0;

    if (gameMode === 'Story') {
        searchDepth = STORY_ENEMIES[currentStage].depth;
        randomChance = STORY_ENEMIES[currentStage].randomness;
    } else if (gameMode === 'TrueStory') {
        searchDepth = TRUE_STORY_ENEMIES[currentStage].depth || 5;
        if (currentStage === 3) searchDepth = 5; // デンセツノキシを強化 (8は深すぎて遅いため5に調整)
        if (currentStage === 4) searchDepth = 5; // ラストライオン
        randomChance = 0; // 真ストーリーではランダム性を排除
    } else if (gameMode === 'PvAI') {
        searchDepth = STORY_ENEMIES[currentStage].depth || 4;
        randomChance = 0;
    }

    // --- ローカルJS AIを実行 ---
    transpositionTable.clear();
    nodesVisited = 0;

    const moves = getAllPossibleMoveWithScores(2);
    if (moves.length === 0) {
        // 投了処理
        gameOver = true;
        winnerPlayer = 1;
        winnerMessage = "AIが投了しました（指し手なし）";
        render();
        if (gameMode === 'Story' || gameMode === 'TrueStory') {
            setTimeout(() => {
                storyState = 'win';
                showStoryScreen();
            }, 2000);
        }
        return;
    }

    let bestScore = -Infinity;
    let bestMove = null;

    if (Math.random() < randomChance) {
        bestMove = moves[Math.floor(Math.random() * moves.length)];
    } else {
        let bestMoves = [];
        for (let move of moves) {
            let undoInfo = null;
            try {
                undoInfo = applyMoveTemporarily(move, 2);
                const score = minimax(searchDepth - 1, -Infinity, Infinity, false);
                if (score > bestScore) {
                    bestScore = score;
                    bestMoves = [move];
                } else if (score === bestScore) {
                    bestMoves.push(move);
                }
            } catch (err) {
                console.error("AI Minimax error:", err);
            } finally {
                if (undoInfo) undoMoveTemporarily(undoInfo, 2);
            }
        }
        if (bestMoves.length > 0) {
            bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
    }

    if (!bestMove) bestMove = moves[0];
    executeBestMove(bestMove);
}

function executeBestMove(bestMove) {
    if (gameOver) return;

    if (bestMove.type === 'move') {
        selectedPos = bestMove.from;
        executeMove(bestMove.from, bestMove.to);
    } else if (bestMove.type === 'drop') {
        // AI Drop handling
        board[bestMove.to.r][bestMove.to.c] = { type: bestMove.pieceType, player: 2 };
        hands[2].splice(bestMove.handIndex, 1);

        // Unlike move, drop can't trigger capture/promotion in practice

        if (!gameOver) {
            switchTurn();
        }
    }

    // Check for Fire Breath Warning (After move or drop)
    if (gameMode === 'TrueStory' && (currentStage === 1 || currentStage === 3) && (aiTurnCount % 4 === 3)) {
        fireBreathWarning = true;
    } else {
        fireBreathWarning = false;
    }
    // Check for Last Lion Purge Warning (After move or drop)
    if (gameMode === 'TrueStory' && currentStage === 4 && (aiTurnCount % 3 === 2)) {
        lastLionPurgeWarning = true;
    } else {
        lastLionPurgeWarning = false;
    }
    render();
}

// Helper to check for game end conditions after any state change
