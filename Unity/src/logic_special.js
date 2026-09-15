// --- Special Condition Checks ---
function getDarkLionPosition() {
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            if (board[r][c] && board[r][c].player === 2 && board[r][c].isDarkLion) {
                return { r, c };
            }
        }
    }
    return null;
}

function handlePhoenixRevival(target, player) {
    // playerは捕獲した側。復活するライオンの持ち主は owner
    const owner = player === 1 ? 2 : 1;
    // 復活地点（owner 2は一番奥(0)、owner 1は手前(3)）
    const reviveR = owner === 2 ? 0 : (boardRows - 1);
    const reviveC = 1;

    // 復活地点にある駒をチェック
    const blockPiece = board[reviveR][reviveC];
    if (blockPiece && blockPiece.player === player) {
        // ライオンの駒がある場合の復活阻止して勝利
        gameOver = true;
        winnerPlayer = player;
        const pText = player === 1 ? 'Player 1 (青)' : 'Player 2 (赤)';
        winnerMessage = `${pText} の勝利！！フェニックスの復活を阻止しました！`;
        return false; // Did not revive
    } else {
        // 復活処理（味方の駒があれば手駒に戻す）
        if (blockPiece && blockPiece.player === owner) {
            let recoveredType = blockPiece.type === TYPES.HEN ? TYPES.CHICK : blockPiece.type;
            hands[owner].push(recoveredType);
        }

        // 復活するライオンを配置（元の能力である isDarkLion 等を引き継ぐ）
        board[reviveR][reviveC] = { 
            type: TYPES.LION, 
            player: owner, 
            isPhoenixLion: target.isPhoenixLion,
            isDarkLion: target.isDarkLion || false,
            hasRevived: true 
        };

        // 復活演出
        showBoardMessage('🔥「俺はまだ！倒れない！！」', 1500);
        return { revived: true, reviveR, reviveC }; // Revived location returned
    }
}

function applyGhostCaptureLogic(capturedType, player) {
    // デンセツノキシ (Stage 4) 伝説の騎士 AIがゴースト騎士を倒すと手駒に加える
    if (gameMode === 'TrueStory' && currentStage === 3 && player === 2 && (capturedType === TYPES.CHICK || capturedType === TYPES.HEN)) {
        return TYPES.GHOST_HEN;
    }
    return capturedType;
}

function isGhostPiece(type) {
    return PIECES[type] && PIECES[type].ghost;
}
