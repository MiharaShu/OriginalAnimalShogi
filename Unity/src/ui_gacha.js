function showGachaScreen() {
    hideAllScreens();
    document.getElementById('gachaScreen').style.display = 'flex';
    
    // Set up 3D card structure
    document.getElementById('gachaResult').innerHTML = `
        <div class="gacha-glow" id="gachaGlow"></div>
        <div class="gacha-card-container">
            <div class="gacha-card" id="gachaCard">
                <div class="gacha-card-front">?</div>
                <div class="gacha-card-back" id="gachaCardBack"></div>
            </div>
        </div>
    `;
    
    document.getElementById('gachaResultName').textContent = "";
    document.getElementById('gachaResultRarity').textContent = "ボタンを押してガチャを引こう！";
    document.getElementById('gachaResultRarity').style.color = "#eee";

    // ボタンの状態をリセット
    const rollBtn = document.getElementById('gachaRollBtn');
    rollBtn.style.display = 'inline-block';
    rollBtn.disabled = false;
    rollBtn.style.opacity = '1';

    document.getElementById('gachaNextBtn').style.display = 'none';
}

function useGachaFromStock() {
    if (gachaStock <= 0) return;
    if (gameMode !== 'Story' && gameMode !== 'TrueStory' && gameMode !== 'Endless') return;
    if (currentPlayer !== 1 || isAITurn || gameOver) return;

    gachaStock--;
    isMidGameGacha = true;
    showGachaScreen();
}

function rollGacha() {
    const rollBtn = document.getElementById('gachaRollBtn');
    rollBtn.disabled = true;
    rollBtn.style.opacity = '0.5';

    const nameEl = document.getElementById('gachaResultName');
    const rarityEl = document.getElementById('gachaResultRarity');
    const cardEl = document.getElementById('gachaCard');
    const cardBackEl = document.getElementById('gachaCardBack');
    const glowEl = document.getElementById('gachaGlow');

    // 1. Shaking animation (suspense)
    cardEl.classList.add('shaking');
    rarityEl.textContent = "祈り中...";
    rarityEl.style.color = "#eee";

    setTimeout(() => {
        cardEl.classList.remove('shaking');
        finalizeGacha();
    }, 2000); // 2 seconds of shaking

    function finalizeGacha() {
        const rand = Math.random() * 100;
        let selectedType = TYPES.CHICK;
        let rarity = "NORMAL";
        let color = "#666";
        let jpName = "ひよこ";
        let glowClass = "glow-NORMAL";

        if (rand < 1.0) {
            selectedType = TYPES.RYUO;
            rarity = "LEGENDARY";
            color = "#ff9800";
            jpName = "竜王";
            glowClass = "glow-LEGENDARY";
        } else if (rand < 3.0) {
            selectedType = TYPES.KNIGHT;
            rarity = "EPIC";
            color = "#9c27b0";
            jpName = "ナイト";
            glowClass = "glow-EPIC";
        } else if (rand < 7.0) {
            selectedType = TYPES.HAWK;
            rarity = "RARE";
            color = "#2196f3";
            jpName = "タカ";
            glowClass = "glow-RARE";
        } else if (rand < 11.0) {
            selectedType = TYPES.LEOPARD;
            rarity = "SUPER RARE";
            color = "#f44336";
            jpName = "忍者ヒョウ";
            glowClass = "glow-SUPER-RARE";
        } else if (rand < 20.0) {
            selectedType = TYPES.GHOST_HEN;
            rarity = "RARE";
            color = "#2196f3";
            jpName = "幽霊にわとり";
            glowClass = "glow-RARE";
        } else if (rand < 35.0) {
            selectedType = TYPES.GIRAFFE;
            rarity = "COMMON";
            color = "#4caf50";
            jpName = "きりん";
            glowClass = "glow-COMMON";
        } else if (rand < 60.0) {
            selectedType = TYPES.ELEPHANT;
            rarity = "COMMON";
            color = "#4caf50";
            jpName = "ぞう";
            glowClass = "glow-COMMON";
        } else {
            selectedType = TYPES.CHICK;
            rarity = "NORMAL";
            color = "#9e9e9e";
            jpName = "ひよこ";
            glowClass = "glow-NORMAL";
        }

        gachaRewardPiece = selectedType;
        
        // Setup card back
        cardBackEl.innerHTML = `<img src="${PIECES[selectedType].image}" style="width:90px;height:90px;">`;
        cardBackEl.style.borderColor = color;

        // Flip animation
        cardEl.classList.add('flipped');
        
        // Show glow
        glowEl.className = `gacha-glow active ${glowClass}`;

        // Text reveal with slight delay
        setTimeout(() => {
            nameEl.textContent = jpName;
            rarityEl.textContent = `レアリティ: ${rarity}`;
            rarityEl.style.color = color;
            
            document.getElementById('gachaRollBtn').style.display = 'none';
            document.getElementById('gachaNextBtn').style.display = 'inline-block';

            if (isMidGameGacha) {
                hands[1].push(gachaRewardPiece);
                gachaRewardPiece = null;
                document.getElementById('gachaNextBtn').textContent = '対局に戻る';
            } else {
                document.getElementById('gachaNextBtn').textContent = '次のステージへ →';
            }
        }, 300); // 0.3s after flip starts
    }
}

function proceedAfterGacha() {
    if (isMidGameGacha) {
        isMidGameGacha = false;
        hideAllScreens();
        document.getElementById('gameContainer').style.display = 'flex';
        render();
        return;
    }

    currentStage++;
    storyState = 'intro';
    currentIntroStep = 0;
    showStoryScreen();
}
