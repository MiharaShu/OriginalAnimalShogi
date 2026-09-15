// --- Move Generation & Validation ---

function getAllPossibleMoveWithScores(player) {
    const moves = getAllPossibleMoves(player);

    moves.forEach(move => {
        let score = 0;
        if (move.type === 'move') {
            const target = board[move.to.r][move.to.c];
            if (target) {
                if (target.type === TYPES.LION) {
                    score += 50000;
                } else {
                    score += 100 + PIECE_VALUES[target.type === TYPES.HEN ? TYPES.CHICK : target.type];
                }
            }
            const piece = board[move.from.r][move.from.c];
            if (piece.type === TYPES.CHICK && ((player === 1 && move.to.r === 0) || (player === 2 && move.to.r === boardRows - 1))) {
                score += 50;
            }
        } else if (move.type === 'drop') {
            score += 10;
        }
        move.score = score;
    });

    return moves.sort((a, b) => b.score - a.score);
}

function getAllPossibleMoves(player) {
    const moves = [];

    // 1. Board moves
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            const piece = board[r][c];
            if (piece && piece.player === player) {
                const pieceData = PIECES[piece.type];
                const directionY = player === 1 ? 1 : -1;

                // 1.1 Standard moves
                if (pieceData.moves) {
                    pieceData.moves.forEach(m => {
                        const dc = m[0];
                        const dr = m[1] * directionY;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                            const targetPiece = board[nr][nc];
                            if (!targetPiece || targetPiece.player !== player) {
                                // 神の砂時計ナーフ: 追加ターン中はライオンを取れない
                                if (isExtraTurn && targetPiece && targetPiece.type === TYPES.LION) {
                                    // Skip
                                } else {
                                    moves.push({ type: 'move', from: { r, c }, to: { r: nr, c: nc } });
                                }
                            }
                        }
                    });
                }

                // 1.2 Sliding moves
                if (pieceData.sliding) {
                    pieceData.sliding.forEach(m => {
                        const dc = m[0];
                        const dr = m[1] * directionY;
                        let nr = r + dr;
                        let nc = c + dc;
                        while (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                            const targetPiece = board[nr][nc];
                            if (!targetPiece) {
                                moves.push({ type: 'move', from: { r, c }, to: { r: nr, c: nc } });
                            } else {
                                if (targetPiece.player !== player) {
                                    // 神の砂時計ナーフ: 追加ターン中はライオンを取れない
                                    if (isExtraTurn && targetPiece && targetPiece.type === TYPES.LION) {
                                        // Skip
                                    } else {
                                        moves.push({ type: 'move', from: { r, c }, to: { r: nr, c: nc } });
                                    }
                                }
                                break; 
                            }
                            nr += dr;
                            nc += dc;
                        }
                    });
                }

                // 1.3 Jump moves
                if (pieceData.jumps) {
                    pieceData.jumps.forEach(m => {
                        const dc = m[0];
                        const dr = m[1] * directionY;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                            const targetPiece = board[nr][nc];
                            if (!targetPiece || targetPiece.player !== player) {
                                // 神の砂時計ナーフ: 追加ターン中はライオンを取れない
                                if (isExtraTurn && targetPiece && targetPiece.type === TYPES.LION) {
                                    // Skip
                                } else {
                                    moves.push({ type: 'move', from: { r, c }, to: { r: nr, c: nc } });
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    // 2. Hand drops
    const seenTypes = new Set();
    hands[player].forEach((pieceType, index) => {
        if (seenTypes.has(pieceType)) return;
        seenTypes.add(pieceType);

        for (let r = 0; r < boardRows; r++) {
            for (let c = 0; c < boardCols; c++) {
                if (!board[r][c]) {
                    moves.push({ type: 'drop', pieceType: pieceType, handIndex: index, to: { r, c } });
                }
            }
        }
    });

    return moves;
}

function isSquareUnderAttack(r, c, attackerPlayer) {
    for (let br = 0; br < boardRows; br++) {
        for (let bc = 0; bc < boardCols; bc++) {
            const piece = board[br][bc];
            if (piece && piece.player === attackerPlayer) {
                const pieceData = PIECES[piece.type];
                const directionY = attackerPlayer === 1 ? 1 : -1;

                if (pieceData.moves) {
                    for (let m of pieceData.moves) {
                        const dc = m[0];
                        const dr = m[1] * directionY;
                        if (br + dr === r && bc + dc === c) return true;
                    }
                }
                if (pieceData.sliding) {
                    for (let m of pieceData.sliding) {
                        const dc = m[0];
                        const dr = m[1] * directionY;
                        let nr = br + dr;
                        let nc = bc + dc;
                        while (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                            if (nr === r && nc === c) return true;
                            if (board[nr][nc]) break;
                            nr += dr;
                            nc += dc;
                        }
                    }
                }
                if (pieceData.jumps) {
                    for (let m of pieceData.jumps) {
                        const dc = m[0];
                        const dr = m[1] * directionY;
                        if (br + dr === r && bc + dc === c) return true;
                    }
                }
            }
        }
    }
    return false;
}

// Apply a move temporally and return undo info
function applyMoveTemporarily(move, player) {
    const undoInfo = {
        type: move.type, from: move.from, to: move.to,
        capturedPiece: null, promoted: false,
        pieceType: move.pieceType, handIndex: move.handIndex
    };

    if (move.type === 'move') {
        const piece = board[move.from.r][move.from.c];
        const target = board[move.to.r][move.to.c];

        if (target) {
            undoInfo.capturedPiece = target;
            if (target.type === TYPES.LION && target.isPhoenixLion && !target.hasRevived) {
                // Simplified simulation of Phoenix for AI Evaluation
                undoInfo.phoenixRevived = true;
                undoInfo.phoenixReplacedPiece = board[0][1];
                board[0][1] = { type: TYPES.LION, player: 2, isPhoenixLion: true, hasRevived: true };
            } else {
                let capturedType = target.type === TYPES.HEN ? TYPES.CHICK : target.type;
                capturedType = applyGhostCaptureLogic(capturedType, player);
                if (!isGhostPiece(capturedType) || (gameMode === 'TrueStory' && currentStage === 3 && player === 2)) {
                    hands[player].push(capturedType);
                }
            }
        }

        board[move.to.r][move.to.c] = piece;
        board[move.from.r][move.from.c] = null;

        if (piece.type === TYPES.CHICK) {
            if ((player === 1 && move.to.r === 0) || (player === 2 && move.to.r === boardRows - 1)) {
                piece.type = TYPES.HEN;
                undoInfo.promoted = true;
            }
        }
    } else if (move.type === 'drop') {
        board[move.to.r][move.to.c] = { type: move.pieceType, player: player };
        hands[player].splice(move.handIndex, 1);
    }

    return undoInfo;
}

function undoMoveTemporarily(undoInfo, player) {
    if (undoInfo.type === 'move') {
        const piece = board[undoInfo.to.r][undoInfo.to.c];
        board[undoInfo.from.r][undoInfo.from.c] = piece;

        if (undoInfo.phoenixRevived) {
            board[0][1] = undoInfo.phoenixReplacedPiece;
            board[undoInfo.to.r][undoInfo.to.c] = undoInfo.capturedPiece;
        } else {
            board[undoInfo.to.r][undoInfo.to.c] = undoInfo.capturedPiece;
            if (undoInfo.capturedPiece && (!isGhostPiece(undoInfo.capturedPiece.type) || (gameMode === 'TrueStory' && currentStage === 3 && player === 2))) {
                const capturedType = undoInfo.capturedPiece.type === TYPES.HEN ? TYPES.CHICK : undoInfo.capturedPiece.type;
                const appliedType = applyGhostCaptureLogic(capturedType, player);
                const idx = hands[player].lastIndexOf(appliedType);
                if (idx !== -1) hands[player].splice(idx, 1);
            }
        }

        if (undoInfo.promoted) {
            piece.type = TYPES.CHICK;
        }
    } else if (undoInfo.type === 'drop') {
        board[undoInfo.to.r][undoInfo.to.c] = null;
        hands[player].splice(undoInfo.handIndex, 0, undoInfo.pieceType);
    }
}

function calculateValidMoves(r, c, piece) {
    validMoves = [];
    const pieceData = PIECES[piece.type];
    const directionY = piece.player === 1 ? 1 : -1;

    if (pieceData.moves) {
        pieceData.moves.forEach(m => {
            const nr = r + m[1] * directionY;
            const nc = c + m[0];
                if (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                const targetPiece = board[nr][nc];
                if (!targetPiece || targetPiece.player !== currentPlayer) {
                    // 神の砂時計ナーフ: 追加ターン中はライオンを取れない
                    if (isExtraTurn && targetPiece && targetPiece.type === TYPES.LION) {
                        // Skip
                    } else {
                        validMoves.push({ r: nr, c: nc });
                    }
                }
            }
        });
    }

    if (pieceData.sliding) {
        pieceData.sliding.forEach(m => {
            let nr = r + m[1] * directionY;
            let nc = c + m[0];
            while (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                const targetPiece = board[nr][nc];
                if (!targetPiece) {
                    validMoves.push({ r: nr, c: nc });
                } else {
                    if (targetPiece.player !== currentPlayer) {
                        // 神の砂時計ナーフ: 追加ターン中はライオンを取れない
                        if (isExtraTurn && targetPiece && targetPiece.type === TYPES.LION) {
                            // Skip
                        } else {
                            validMoves.push({ r: nr, c: nc });
                        }
                    }
                    break; 
                }
                nr += m[1] * directionY;
                nc += m[0];
            }
        });
    }

    if (pieceData.jumps) {
        pieceData.jumps.forEach(m => {
            const nr = r + m[1] * directionY;
            const nc = c + m[0];
                if (nr >= 0 && nr < boardRows && nc >= 0 && nc < boardCols) {
                const targetPiece = board[nr][nc];
                if (!targetPiece || targetPiece.player !== currentPlayer) {
                    // 神の砂時計ナーフ: 追加ターン中はライオンを取れない
                    if (isExtraTurn && targetPiece && targetPiece.type === TYPES.LION) {
                        // Skip
                    } else {
                        validMoves.push({ r: nr, c: nc });
                    }
                }
            }
        });
    }
}
