function runTutorialStep(isRedraw = false) {
    const msgEl = document.getElementById('tutorialMessage');
    const nextBtn = document.getElementById('tutorialNextBtn');
    const p1 = 1; // Human player ID
    const p2 = 2; // AI/Opponent ID

    if (!isRedraw) {
        // Clear board states on new step
        boardRows = 4;
        boardCols = 3;
        board = Array(4).fill(null).map(() => Array(3).fill(null));
        hands = { 1: [], 2: [] };
        currentPlayer = 1;
        selectedPos = null;
        selectedHandIndex = null;
        validMoves = [];
        gameOver = false;
        tutorialExpectedMove = null;
        tutorialHighlightCells = [];
        tutorialHighlightPiece = null;
        allowAnyMove = false;
    }

    nextBtn.style.display = "none";
    nextBtn.textContent = "次へ";

    // Phase 1 & 2
    if (currentTutorialStep === 0) {
        // Welcome
        msgEl.innerHTML = "どうぶつ将棋の世界へようこそ！<br>このモードでは基本的な遊び方を学びます。";
        nextBtn.style.display = "inline-block";

        // Show standard setup just for visual
        board[0][0] = { type: TYPES.GIRAFFE, player: 2 }; board[1][1] = { type: TYPES.CHICK, player: 2 };
        board[0][1] = { type: TYPES.LION, player: 2 };
        board[0][2] = { type: TYPES.ELEPHANT, player: 2 };
        board[3][0] = { type: TYPES.ELEPHANT, player: 1 }; board[2][1] = { type: TYPES.CHICK, player: 1 };
        board[3][1] = { type: TYPES.LION, player: 1 };
        board[3][2] = { type: TYPES.GIRAFFE, player: 1 };
    }
    else if (currentTutorialStep === 1) {
        // Chick move
        msgEl.innerHTML = "最初は、<b style='color:#fbc02d'>ひよこ</b>の動かし方です。<br>ひよこは<b>前に1マスだけ</b>進めます。<br><br>光っているひよこをタップし、盤面のマスへ動かしてみましょう！";
        board[3][1] = { type: TYPES.CHICK, player: p1 };
        tutorialHighlightPiece = { r: 3, c: 1 };
        tutorialHighlightCells = [{ r: 2, c: 1 }];
        tutorialExpectedMove = { from: { r: 3, c: 1 }, to: { r: 2, c: 1 } };
    }
    else if (currentTutorialStep === 2) {
        // Elephant move
        msgEl.innerHTML = "素晴らしい！<br>次は、<b style='color:#81d4fa'>ぞう</b>です。<br>ぞうは<b>ナナメの4方向</b>のどこかに1マス進めます。<br>光っているマスに動かしてみましょう！";
        board[2][1] = { type: TYPES.ELEPHANT, player: p1 };
        tutorialHighlightPiece = { r: 2, c: 1 };
        tutorialHighlightCells = [{ r: 1, c: 2 }]; // Top-right
        tutorialExpectedMove = { from: { r: 2, c: 1 }, to: { r: 1, c: 2 } };
    }
    else if (currentTutorialStep === 3) {
        // Giraffe move
        msgEl.innerHTML = "その調子！<br>次は、<b style='color:#ffcc80'>きりん</b>です。<br>きりんは<b>タテヨコの4方向</b>のどこかに1マス進めます。<br>前に動かしてみましょう！";
        board[2][1] = { type: TYPES.GIRAFFE, player: p1 };
        tutorialHighlightPiece = { r: 2, c: 1 };
        tutorialHighlightCells = [{ r: 1, c: 1 }]; // Up
        tutorialExpectedMove = { from: { r: 2, c: 1 }, to: { r: 1, c: 1 } };
    }
    else if (currentTutorialStep === 4) {
        // Lion move
        msgEl.innerHTML = "完璧です！<br>最後に、<b style='color:#ef5350'>ライオン</b>です。ライオンが取られると負けです。<br>ライオンは<b>全方向（8方向）</b>のどこかに1マス進めます。<br>好きな場所へ動かしてみましょう！";
        board[2][1] = { type: TYPES.LION, player: p1 };

        if (!isRedraw) {
            allowAnyMove = true; // Let them move anywhere valid for the lion
            // No specific expected move, handled differently in this step
        }
    }
    else if (currentTutorialStep === 5) {
        // Capture mechanic
        msgEl.innerHTML = "駒の動かし方はバッチリです！！<br>次は、<b>取る</b>ルールです。<br>自分の駒の動ける場所に相手の駒がある時、相手の駒を取ることができます。<br>光っている、<b>ぞう</b>で相手の、<b>ひよこ</b>を取ってみましょう！";
        board[2][1] = { type: TYPES.ELEPHANT, player: p1 };
        board[1][0] = { type: TYPES.CHICK, player: p2 }; // target to capture

        tutorialHighlightPiece = { r: 2, c: 1 };
        tutorialHighlightCells = [{ r: 1, c: 0 }];
        tutorialExpectedMove = { from: { r: 2, c: 1 }, to: { r: 1, c: 0 } };

        // Reset hand just in case
        hands = { 1: [], 2: [] };
    }
    else if (currentTutorialStep === 6) {
        // Drop mechanic
        msgEl.innerHTML = "お見事！取った駒は、<b>持ち駒</b>になります。<br>自分の番に、持ち駒を空いているマスに、<b>打つ（置く）</b>ことができます。<br>画面下の持ち駒から「ひよこ」を選んで、光っているマスに打ってみましょう！";

        // Provide a hand piece
        hands[1] = [TYPES.CHICK];
        board[3][0] = { type: TYPES.LION, player: p1 }; // Just some standard pieces to make it look active
        board[0][2] = { type: TYPES.LION, player: p2 };

        tutorialHighlightPiece = null;
        tutorialHighlightCells = [{ r: 1, c: 1 }]; // Drop target
        tutorialExpectedMove = { type: 'drop', pieceType: TYPES.CHICK, to: { r: 1, c: 1 } };
    }
    else if (currentTutorialStep === 7) {
        // Promotion
        msgEl.innerHTML = "ついに終盤！<br>次は、<b>成る（パワーアップ）</b>ルールです。<br>相手の一番奥の列に「ひよこ」が進むと、<b style='color:#e53935'>にわとり</b>にパワーアップします。<br>ひよこを前へ進めてみましょう！";

        board[2][1] = { type: TYPES.CHICK, player: p1 };
        board[0][0] = { type: TYPES.GIRAFFE, player: p2 };
        board[0][2] = { type: TYPES.ELEPHANT, player: p2 };

        tutorialHighlightPiece = { r: 2, c: 1 };
        tutorialHighlightCells = [{ r: 1, c: 1 }]; // Target (needs to be one row away so it promotes on move to row 0, but wait, promotion happens on moving INTO row 0. So let's start Chick at row 1, moving to row 0.'

        // Adjusting for actual promotion move
        board[2][1] = null;
        board[1][1] = { type: TYPES.CHICK, player: p1 };
        tutorialHighlightPiece = { r: 1, c: 1 };
        tutorialHighlightCells = [{ r: 0, c: 1 }];
        tutorialExpectedMove = { from: { r: 1, c: 1 }, to: { r: 0, c: 1 } };

        hands = { 1: [], 2: [] };
    }
    else if (currentTutorialStep === 8) {
        // Promotion follow-up
        msgEl.innerHTML = "やりました！「にわとり」になりました。<br>にわとりは、<b style='color:#e53935'>前、ナナメ前、横、後ろ</b>の6方向に進めます！（ナナメ後ろ以外）<br>（次へを押して進んでください）";

        board[0][1] = { type: TYPES.HEN, player: p1 };
        nextBtn.style.display = "inline-block";
        allowAnyMove = false;
        tutorialExpectedMove = null;
        tutorialHighlightPiece = null;
        tutorialHighlightCells = [];
    }
    else if (currentTutorialStep === 9) {
        // Catch Victory
        msgEl.innerHTML = "さあ、いよいよ<b>勝利条件</b>です。<br>一つ目は、<b>キャッチ</b>です。相手のライオンを取れば勝ちです！<br>前のステップで生み出した「にわとり」で相手のライオンをキャッチしてみましょう！";

        board[1][1] = { type: TYPES.HEN, player: p1 };
        board[0][1] = { type: TYPES.LION, player: p2 };

        tutorialHighlightPiece = { r: 1, c: 1 };
        tutorialHighlightCells = [{ r: 0, c: 1 }];
        tutorialExpectedMove = { from: { r: 1, c: 1 }, to: { r: 0, c: 1 } };
    }
    else if (currentTutorialStep === 10) {
        // Catch Win follow-up
        msgEl.innerHTML = "お見事！これが一つ目の勝ち方です。<br>（次へを押して最後のルールへ）";
        nextBtn.style.display = "inline-block";

        board[0][1] = null; // simulate Lion being captured
        tutorialExpectedMove = null;
        tutorialHighlightPiece = null;
        tutorialHighlightCells = [];
    }
    else if (currentTutorialStep === 11) {
        // Try Victory
        msgEl.innerHTML = "最後のルールです！<br>もう一つの勝ち方は、<b>トライ</b>です。<br>自分のライオンが<b>相手の一番奥の列</b>に進むと勝ちになります！（※その移動で相手に取られない安全なマスである必要があります）<br>ライオンを左奥へトライさせてみましょう！";

        board[1][0] = { type: TYPES.LION, player: p1 };
        board[0][2] = { type: TYPES.ELEPHANT, player: p2 }; // Block right top, leaving left top safe

        tutorialHighlightPiece = { r: 1, c: 0 };
        tutorialHighlightCells = [{ r: 0, c: 0 }];
        tutorialExpectedMove = { from: { r: 1, c: 0 }, to: { r: 0, c: 0 } };
    }
    else {
        // Final
        msgEl.innerHTML = "チュートリアルクリアおめでとうございます！🎁<br>これであなたもどうぶつ将棋のスターです。<br>まずはAIと対戦して腕を磨いてみましょう！";
        board[0][0] = { type: TYPES.LION, player: p1 }; // Show successful try
        nextBtn.textContent = "タイトルに戻る";
        nextBtn.style.display = "inline-block";
    }

    render();
}

function nextTutorialStep() {
    if (currentTutorialStep >= 12) {
        showTitleScreen();
        return;
    }
    currentTutorialStep++;
    runTutorialStep();
}
