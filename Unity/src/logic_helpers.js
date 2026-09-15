// --- Helper Ability Logic ---

function useHelper(type) {
    if (gameMode !== 'TrueStory' && gameMode !== 'Story' && gameMode !== 'Endless') return;
    if (currentPlayer !== 1 || isAITurn || gameOver) return;
    if (!availableHelpers[type]) return;

    // Reset selection before starting helper
    clearSelection();

    // Cancel active mode if clicking the same button
    if (helperActiveMode === type) {
        helperActiveMode = null;
        render();
        return;
    }

    if (type === 'superChick') {
        hands[1].push(TYPES.CHICK, TYPES.CHICK, TYPES.CHICK);
        availableHelpers.superChick = false;
        showQuickNotice("🐣 スーパーヒヨコ大作戦を発動！持ち駒にヒヨコ3つ追加されました！");
    } else if (type === 'eradicate') {
        helperActiveMode = 'eradicate';
        showQuickNotice("🦁 ライオンの滅却を発動準備中... 盤上の相手の駒（ライオン以外）をクリックしてください。");
    } else if (type === 'phoenix') {
        helperActiveMode = 'phoenix';
        showQuickNotice("🔥 フェニックスの羽を発動準備中... 盤上の自分のヒヨコをクリックしてください。");
    } else if (type === 'awaken') {
        // Find human lion position
        let lionPos = null;
        for (let r = 0; r < boardRows; r++) {
            for (let c = 0; c < boardCols; c++) {
                if (board[r][c] && board[r][c].player === 1 && board[r][c].type === TYPES.LION) {
                    lionPos = { r, c };
                    break;
                }
            }
        }
        if (lionPos) {
            board[lionPos.r][lionPos.c].hasRevived = false; 
            board[lionPos.r][lionPos.c].isPhoenixLion = true;
            availableHelpers.awaken = false;
            showQuickNotice("👑 「王の覚醒」発動！あなたのライオンが一度だけ復活能力を得ました！");
        } else {
            showQuickNotice("⚠️ 盤面にライオンがいません。");
        }
    } else if (type === 'timeStop') {
         availableHelpers.timeStop = false;
         showQuickNotice("⏳ 「神の砂時計」発動！連続でもう一度あなたのターンです！");
         isTimeStopping = true; 
    } else if (type === 'reunion') {
         hands[1].push(TYPES.GIRAFFE, TYPES.ELEPHANT);
         availableHelpers.reunion = false;
         showQuickNotice("「リユニオン」発動！懐かしい仲間が駆けつけました！");

    }
    
    render();
}
