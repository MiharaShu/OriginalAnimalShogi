// --- Screen Navigation ---
// タイトル・各モード選択画面への遷移を管理します

function showTitleScreen() {
    hideAllScreens();
    document.getElementById('titleScreen').style.display = 'flex';
    if (typeof AudioEngine !== 'undefined' && typeof AudioEngine.stopBGM === 'function') {
        AudioEngine.stopBGM();
    }
}

function showAiLevelSelect() {
    hideAllScreens();
    document.getElementById('aiLevelScreen').style.display = 'flex';
}

function startGame(mode) {
    gameMode = mode;
    hideAllScreens();
    document.getElementById('gameContainer').style.display = 'flex';
    initGame();
}

function startFreeAi(level) {
    gameMode = 'PvAI';
    currentStage = level - 1; // 1-4 -> 0-3
    hideAllScreens();
    document.getElementById('gameContainer').style.display = 'flex';
    initGame();
}

function startStoryMode() {
    gameMode = 'Story';
    currentStage = 0;
    storyState = 'intro';
    if (equippedHelpers.length > 1) {
        equippedHelpers = equippedHelpers.slice(0, 1);
    }
    showStoryScreen();
}

function startTrueStoryMode(forceRestart = false) {
    const card = document.getElementById('trueStoryCard');
    if (card.classList.contains('locked') && !forceRestart) {
        showModal('ストーリーモードをすべてクリアすると解放されます！', '🔒 ロック中');
        return;
    }
    gameMode = 'TrueStory';
    currentStage = 0;
    storyState = 'intro';
    currentIntroStep = 0;
    if (equippedHelpers.length > 3) {
        equippedHelpers = equippedHelpers.slice(0, 3);
    }
    helperActiveMode = null;
    showStoryScreen();
}

function startTutorialMode() {
    gameMode = 'Tutorial';
    currentTutorialStep = 0;
    document.getElementById('tutorialOverlay').style.display = 'block';
    hideAllScreens();
    document.getElementById('gameContainer').style.display = 'flex';
    runTutorialStep();
}

