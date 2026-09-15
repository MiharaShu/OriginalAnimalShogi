// --- Interaction & Input Handling ---

function handleCellClick(r, c) {
    if (gameOver || isAITurn) return; // Ignore input if game over or AI is thinking

    if (gameMode === 'Tutorial') {
        if (currentTutorialStep === 4 && allowAnyMove) {
            if (selectedPos) {
                const isValid = validMoves.some(m => m.r === r && m.c === c);
                if (isValid) {
                    executeMove(selectedPos, { r, c });
                    setTimeout(() => {
                        nextTutorialStep();
                    }, 1000);
                    return;
                }
            }
        }
    }
    // --- Special Helper Invocation ---
    if (helperActiveMode) {
        const piece = board[r][c];
        if (helperActiveMode === 'eradicate') {
            if (piece && piece.player === 2 && piece.type !== TYPES.LION) {
                board[r][c] = null;
                availableHelpers.eradicate = false;
                helperActiveMode = null;
                clearSelection();
                showQuickNotice('💥 相手の駒を消し去りました！ターンは続きます。');
                render();
                return;
            } else {
                // ライオンまたは自駒をクリック→モード維持、空マスクリック→キャンセル
                showQuickNotice('⚠️ ライオン以外の相手の駒を選んでください。');
                if (!piece || piece.player === 1) {
                    helperActiveMode = null;
                    render();
                }
                return;
            }
        } else if (helperActiveMode === 'phoenix') {
            if (piece && piece.player === 1 && (piece.type === TYPES.CHICK || piece.type === TYPES.HEN)) {
                board[r][c].type = TYPES.HEN;
                availableHelpers.phoenix = false;
                helperActiveMode = null;
                clearSelection();
                showQuickNotice('🔥 ひよこがにわとりに進化！ターンは続きます。');
                render();
                return;
            } else {
                // 対象以外の駒をクリック→モード維持、空マス・相手駒→キャンセル
                if (!piece || piece.player === 2) {
                    helperActiveMode = null;
                    render();
                }
                return;
            }
        }
    }
    // ---------------------------------

    // If a hand piece is selected (trying to drop)
    if (selectedHandIndex !== null) {
        // Tutorial Override for drop
        if (gameMode === 'Tutorial' && !allowAnyMove) {
            if (tutorialExpectedMove && tutorialExpectedMove.type === 'drop') {
                if (r !== tutorialExpectedMove.to.r || c !== tutorialExpectedMove.to.c) {
                    const msgEl = document.getElementById('tutorialMessage');
                    const originalMsg = msgEl.innerText;
                    msgEl.innerHTML = `<span style="color:#d32f2f">そこではありません。光っているマスに打ってください。</span>`;
                    setTimeout(() => {
                        if (msgEl.innerHTML.includes("そこではありません")) {
                            msgEl.innerText = originalMsg;
                            runTutorialStep(true);
                        }
                    }, 1500);

                    clearSelection();
                    render();
                    return;
                }
            } else if (tutorialExpectedMove && tutorialExpectedMove.type !== 'drop') {
                // Not supposed to drop now
                clearSelection();
                render();
                return;
            }
        }

        if (!board[r][c]) { // Valid drop on an empty square
            const pieceType = hands[currentPlayer][selectedHandIndex.index];

            // Remove from hand, add to board
            hands[currentPlayer].splice(selectedHandIndex.index, 1);
            board[r][c] = { type: pieceType, player: currentPlayer };
            AudioEngine.playMove();

            // Hook for passing the tutorial step (dropping)
            if (gameMode === 'Tutorial' && tutorialExpectedMove && tutorialExpectedMove.type === 'drop') {
                setTimeout(() => {
                    nextTutorialStep();
                }, 500);
                clearSelection();
                render();
                return;
            }

            if (gameMode === 'Puzzle') {
                handlePuzzleMove();
                clearSelection();
                render();
                return; // switchTurnは handlePuzzleMove内のコールバックで算出
            }
            clearSelection();
            switchTurn();
            render();
        } else {
            // Invalid drop, clear selection
            clearSelection();
            render();
        }
        return;
    }

    // If a board piece is selected (trying to move)
    if (selectedPos) {
        const isValid = validMoves.some(m => m.r === r && m.c === c);

        // Tutorial override for moving
        if (gameMode === 'Tutorial' && !allowAnyMove) {
            if (tutorialExpectedMove) {
                if (selectedPos.r !== tutorialExpectedMove.from.r || selectedPos.c !== tutorialExpectedMove.from.c ||
                    r !== tutorialExpectedMove.to.r || c !== tutorialExpectedMove.to.c) {

                    // Invalid tutorial move
                    const msgEl = document.getElementById('tutorialMessage');
                    const originalMsg = msgEl.innerText;
                    msgEl.innerHTML = `<span style="color:#d32f2f">そこではありません。光っているマスに動かしてください。</span>`;
                    setTimeout(() => {
                        if (msgEl.innerHTML.includes("そこではありません")) {
                            msgEl.innerText = originalMsg; // simple restore, might lose formatting but ok for now
                            runTutorialStep(true); // redraw step
                        }
                    }, 1500);

                    clearSelection();
                    render();
                    return;
                }
            }
        }

        if (isValid) {
            executeMove(selectedPos, { r, c });

            // Hook for passing the tutorial step
            if (gameMode === 'Tutorial' && tutorialExpectedMove) {
                setTimeout(() => {
                    nextTutorialStep();
                }, 500);
            }
            return;
        }
        // If clicked somewhere invalid but on own piece, select that piece instead
        // Fallthrough to the next block
    }

    // Select a piece on the board
    const piece = board[r][c];
    if (piece && piece.player === currentPlayer) {
        // Tutorial highlight enforcement for selection
        if (gameMode === 'Tutorial' && !allowAnyMove && tutorialHighlightPiece) {
            if (r !== tutorialHighlightPiece.r || c !== tutorialHighlightPiece.c) {
                clearSelection();
                render();
                return; // Ignore selecting other pieces during guided tutorial
            }
        }

        selectedPos = { r, c };
        selectedHandIndex = null;
        calculateValidMoves(r, c, piece);
        render();
    } else {
        // Clicked on empty space or opponent's piece without any active selection'
        clearSelection();
        render();
    }
}

function handleHandClick(player, index) {
    if (gameOver || isAITurn) return; // Ignore input if game over or AI is thinking
    // Can only select own hand
    if (player !== currentPlayer) return;

    // If clicking same piece again, deselect
    if (selectedHandIndex && selectedHandIndex.index === index) {
        clearSelection();
        render();
        return;
    }

    selectedHandIndex = { player, index };
    selectedPos = null;
    validMoves = [];

    // Calculate valid drop cells (all empty squares)
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            if (!board[r][c]) {
                validMoves.push({ r, c });
            }
        }
    }
    render();
}
