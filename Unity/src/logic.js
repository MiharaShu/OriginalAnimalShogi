function switchTurn() {
    if (isTimeStopping) {
        isTimeStopping = false;
        isExtraTurn = true; // 次の自分のターンが追加ターンとなる
        currentPlayer = 1; // Stay as human
        isAITurn = false;
        render();
        return;
    }
    isExtraTurn = false; // 通常のターン交代ではフラグをリセット

    currentPlayer = currentPlayer === 1 ? 2 : 1;

    // AIターンの判定（'PvAI', 'Story', 'TrueStory'）
    if ((gameMode === 'PvAI' || gameMode === 'Story' || gameMode === 'TrueStory') && currentPlayer === 2 && !gameOver) {
        isAITurn = true;
        fireBreathWarning = false;
        render(); 
        
        // Execute AI move with a small delay for UI responsiveness
        setTimeout(() => {
            try {
                executeAIMove();
            } catch (err) {
                console.error("AI turn failed:", err);
                isAITurn = false;
                render();
            }
        }, 200);
    } else {
        isAITurn = false;
        render();
    }
}

function clearSelection() {
    selectedPos = null;
    selectedHandIndex = null;
    validMoves = [];
}

function executeMove(from, to) {
    // Start animation, then apply state changes
    animatePieceMove(from, to, () => {
        _executeMoveInternal(from, to);
    });
}

function _executeMoveInternal(from, to) {
    const piece = board[from.r][from.c];
    const target = board[to.r][to.c];

    // 1. Capture handling
    let captured = false;
    if (target) {
        captured = true;
        
        // ライオンを取った時（または取られた時）のみエフェクトを出す
        if (target.type === TYPES.LION) {
            playCaptureEffect(to.r, to.c);
        }

        if (target.type === TYPES.LION) {
            if (target.isPhoenixLion && !target.hasRevived) {
                const revivalResult = handlePhoenixRevival(target, currentPlayer);
                if (revivalResult === false && gameOver) {
                    // Revival blocked by capture player piece at revive location
                } else if (revivalResult && revivalResult.revived) {
                    // 復活した場合、その復活したライオンが今回の移動先(to)と被る場合は上書きを避ける
                    if (revivalResult.r === to.r && revivalResult.c === to.c) {
                        gameOver = true;
                        winnerPlayer = currentPlayer;
                        const pText = currentPlayer === 1 ? 'Player 1 (青)' : 'Player 2 (赤)';
                        winnerMessage = `${pText} の勝利！！復活したフェニックスを即座に仕留めました！`;
                        setTimeout(() => {
                            render();
                            if (gameMode === 'Story' || gameMode === 'TrueStory') {
                                storyState = 'win';
                                showStoryScreen();
                            }
                        }, 500);
                    }
                }
            } else {
                gameOver = true;
                winnerPlayer = currentPlayer;
                const pText = currentPlayer === 1 ? 'Player 1 (青)' : 'Player 2 (赤)';
                winnerMessage = `${pText} の勝利！！ライオンを捕まえました！`;
            }
        }

        if (!(target.type === TYPES.LION && target.isPhoenixLion && !gameOver)) {
            const originalIsGhost = isGhostPiece(target.type);
            let capturedType = target.type === TYPES.HEN ? TYPES.CHICK : target.type;
            capturedType = applyGhostCaptureLogic(capturedType, currentPlayer);
            
            if (!originalIsGhost) {
                hands[currentPlayer].push(capturedType);
            }
        }
    }

    // 2. Move piece
    board[to.r][to.c] = piece;
    board[from.r][from.c] = null;

    // 3. Promotion
    let promoted = false;
    if (piece.type === TYPES.CHICK) {
        if ((piece.player === 1 && to.r === 0) || (piece.player === 2 && to.r === boardRows - 1)) {
            piece.type = TYPES.HEN;
            promoted = true;
            playPromotionEffect(to.r, to.c);
        }
    }

    // 4. Try condition
    if (piece.type === TYPES.LION) {
        if ((piece.player === 1 && to.r === 0) || (piece.player === 2 && to.r === boardRows - 1)) {
            const opponent = piece.player === 1 ? 2 : 1;
            if (!isSquareUnderAttack(to.r, to.c, opponent)) {
                gameOver = true;
                winnerPlayer = piece.player;
                const pText = piece.player === 1 ? 'Player 1' : 'Player 2';
                winnerMessage = `${pText} の勝利！！トライ成功！`;
            }
        }
    }

    clearSelection();

    if (gameOver) {
        if (typeof AudioEngine !== 'undefined' && typeof AudioEngine.stopBGM === 'function') {
            AudioEngine.stopBGM();
        }
        if (winnerPlayer === 1) {
            AudioEngine.playWin();
        } else {
            AudioEngine.playLose();
        }
        render();
        if (gameMode === 'Story' || gameMode === 'TrueStory') {
            setTimeout(() => {
                storyState = (winnerPlayer === 1) ? 'win' : 'lose';
                showStoryScreen();
            }, 2000);
        }
    }

    if (gameOver) return;

    if (promoted) {
        AudioEngine.playPromote();
    } else if (captured) {
        AudioEngine.playCapture();
    } else {
        AudioEngine.playMove();
    }

    if (gameMode === 'TrueStory' && currentStage === 1 && currentPlayer === 1) {
        fireBreathWarning = false;
    }
    if (gameMode === 'TrueStory' && currentStage === 4 && currentPlayer === 1) {
        lastLionPurgeWarning = false;
    }

    switchTurn();
}


