// --- Board Rendering ---

function render() {
    if (!isFireBreathPlaying) {
        document.getElementById('tutorialOverlay').style.display = gameMode === 'Tutorial' ? 'block' : 'none';
    }

    // Render Board
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    


    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            const cell = createCell(r, c);
            boardEl.appendChild(cell);
        }
    }

    // Dynamic board size class
    boardEl.classList.remove('board-5rows');
    if (boardRows === 5) {
        boardEl.style.gridTemplateColumns = `repeat(${boardCols}, 110px)`;
        boardEl.style.gridTemplateRows = `repeat(${boardRows}, 110px)`;
        boardEl.classList.add('board-5rows');
    } else {
        boardEl.style.gridTemplateColumns = `repeat(3, 110px)`;
        boardEl.style.gridTemplateRows = `repeat(4, 110px)`;
    }

    renderHand(1, 'hand1', 'Player 1（下・青）の持ち駒');
    renderHand(2, 'hand2', 'Player 2（上・赤）の持ち駒');
    renderHelpers();
    renderGachaStock();
    renderTurnInfo();
}

function createCell(r, c) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const piece = board[r][c];

    // Background decoration/effects
    if (gameMode === 'TrueStory' && currentStage === 2 && isPhoenixLionOnBoard() && r === 0 && c === 1) {
        const heartBg = document.createElement('div');
        heartBg.innerHTML = '❤️';
        heartBg.style.position = 'absolute';
        heartBg.style.fontSize = '40px';
        heartBg.style.opacity = '0.3';
        heartBg.style.pointerEvents = 'none';
        cell.appendChild(heartBg);
    }

    if (burningSquares.some(s => s.r === r && s.c === c)) {
        const fireBg = document.createElement('div');
        fireBg.innerHTML = (gameMode === 'TrueStory' && currentStage === 3) ? '☖' : '🔥';
        fireBg.style.position = 'absolute';
        fireBg.style.fontSize = '50px';
        fireBg.style.zIndex = '5';
        fireBg.style.pointerEvents = 'none';
        fireBg.style.animation = 'pulse-highlight 0.5s infinite';
        cell.appendChild(fireBg);
    }

    if (piece) {
        const img = document.createElement('img');
        if (piece.type === TYPES.LION && piece.isLastLion) {
            img.src = "../assets/images/lastlion.webp";
        } else if (piece.type === TYPES.LION && piece.isDarkLion && piece.isPhoenixLion) {
            img.src = "../assets/images/godlion.webp";
        } else if (piece.type === TYPES.LION && piece.isDarkLion) {
            img.src = "../assets/images/darklion.webp";
        } else if (piece.type === TYPES.LION && piece.isPhoenixLion) {
            img.src = "../assets/images/fenilion.webp";
        } else {
            img.src = PIECES[piece.type].image;
        }
        if (piece.player === 2) img.classList.add('player2-piece');
        cell.appendChild(img);
    }

    if (selectedPos && selectedPos.r === r && selectedPos.c === c) cell.classList.add('selected');
    if (validMoves.some(m => m.r === r && m.c === c)) cell.classList.add('valid-move');

    // Tutorial Highlight
    if (gameMode === 'Tutorial') {
        const isHighlighted = (tutorialHighlightPiece && tutorialHighlightPiece.r === r && tutorialHighlightPiece.c === c) ||
                              tutorialHighlightCells.some(m => m.r === r && m.c === c);
        if (isHighlighted) {
            const h = document.createElement('div');
            h.className = 'tutorial-highlight';
            cell.appendChild(h);
            if (!piece && tutorialHighlightCells.some(m => m.r === r && m.c === c)) {
                const arrow = document.createElement('div');
                arrow.className = 'tutorial-arrow';
                arrow.innerHTML = '👇';
                arrow.style.top = '-10px';
                cell.appendChild(arrow);
            }
        }
    }

    cell.addEventListener('click', () => handleCellClick(r, c));
    return cell;
}

function renderHand(player, elementId, labelText) {
    const handEl = document.getElementById(elementId);
    handEl.innerHTML = `<div class="hand-label">${labelText}</div>`;
    hands[player].forEach((type, index) => {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'hand-piece';
        if (player === 2) pieceDiv.classList.add('player2-piece');
        if (selectedHandIndex?.player === player && selectedHandIndex.index === index) pieceDiv.classList.add('selected');
        const img = document.createElement('img');
        img.src = PIECES[type].image;
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.objectFit = 'contain';
        img.draggable = false;
        pieceDiv.appendChild(img);
        pieceDiv.addEventListener('click', () => handleHandClick(player, index));
        handEl.appendChild(pieceDiv);
    });
    if (hands[player].length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.color = '#ccc';
        emptyMsg.style.fontSize = '12px';
        emptyMsg.style.marginLeft = '10px';
        emptyMsg.textContent = 'なし';
        handEl.appendChild(emptyMsg);
    }
}

function renderHelpers() {
    const cont1 = document.getElementById('helpersContainer');
    const cont2 = document.getElementById('level4HelpersContainer');
    
    const allHelpers = [
        { type: 'superChick', id: 'btnHelperChick' },
        { type: 'eradicate', id: 'btnHelperEradicate' },
        { type: 'phoenix', id: 'btnHelperPhoenix' },
        { type: 'awaken', id: 'btnHelperAwaken' },
        { type: 'timeStop', id: 'btnHelperTimeStop' },
        { type: 'reunion', id: 'btnHelperReunion' }
    ];

    if (gameMode === 'Story' || gameMode === 'TrueStory') {
        // Show containers if any helper is equipped
        const hasLevel1Helpers = allHelpers.slice(0, 3).some(h => equippedHelpers.includes(h.type));
        const hasLevel4Helpers = allHelpers.slice(3).some(h => equippedHelpers.includes(h.type));
        
        cont1.style.display = hasLevel1Helpers ? 'flex' : 'none';
        cont2.style.display = hasLevel4Helpers ? 'flex' : 'none';

        allHelpers.forEach(h => {
            const btn = document.getElementById(h.id);
            if (!btn) return;
            
            const isEquipped = equippedHelpers.includes(h.type);
            btn.style.display = isEquipped ? 'flex' : 'none';
            
            if (isEquipped) {
                if (!availableHelpers[h.type]) {
                    btn.classList.add('used');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('used');
                    btn.disabled = false;
                    if (helperActiveMode === h.type) {
                        btn.style.borderColor = '#ff9800';
                        btn.style.background = 'linear-gradient(145deg, #ffecb3, #ffe082)';
                    } else {
                        btn.style.borderColor = '';
                        btn.style.backgroundColor = '';
                    }
                }
            }
        });
    } else {
        cont1.style.display = 'none';
        cont2.style.display = 'none';
    }
}

function renderGachaStock() {
    const container = document.getElementById('gachaStockContainer');
    if (!container) return;
    if (gameMode === 'Story' || gameMode === 'TrueStory') {
        container.style.display = 'flex';
        const maxGacha = (gameMode === 'TrueStory') ? 5 : 2;
        document.getElementById('gachaStockCount').textContent = gachaStock;
        document.getElementById('maxGachaStock').textContent = `/ ${maxGacha}`;
        const useBtn = document.getElementById('btnUseGachaStock');
        if (gachaStock > 0 && currentPlayer === 1 && !isAITurn && !gameOver) {
            useBtn.disabled = false;
            useBtn.style.opacity = '1';
            useBtn.classList.add('pulse-animation');
        } else {
            useBtn.disabled = true;
            useBtn.style.opacity = '0.5';
            useBtn.classList.remove('pulse-animation');
        }
    } else {
        container.style.display = 'none';
    }
}

function renderTurnInfo() {
    const turnMsg = document.getElementById('turnDisplay');
    if (gameOver) {
        turnMsg.innerHTML = `<span style="color:#d32f2f">${winnerMessage}</span>`;
    } else {
        let p1Name = 'Player 1', p2Name = 'Player 2';
        if (gameMode === 'Story') {
            p2Name = STORY_ENEMIES[currentStage].name.replace('！', '') + '（上・赤）';
            p1Name = 'プレイヤー';
        } else if (gameMode === 'TrueStory') {
            p2Name = TRUE_STORY_ENEMIES[currentStage].name.replace('！', '') + '（上・赤）';
            p1Name = 'プレイヤー';
        } else if (gameMode === 'PvAI') {
            p2Name = 'AI（上・赤）';
            p1Name = 'プレイヤー';
        }
        const pText = currentPlayer === 1 ? p1Name : p2Name;
        const pClass = currentPlayer === 1 ? 'p1-color' : 'p2-color';
        if (isAITurn) {
            turnMsg.innerHTML = `<span class="ai-indicator">${p2Name}が思考中...</span>`;
        } else {
            turnMsg.innerHTML = `<span class="${pClass}">${pText}</span> の番です`;
            
            // 神の砂時計：追加ターン制限の表示
            if (isExtraTurn) {
                turnMsg.innerHTML += `<div style="color:#d32f2f; font-weight:bold; margin-top:5px; animation: pulse-highlight 1.5s infinite;">⏳ 神の砂時計：このターン、ライオンは捕まえられません！</div>`;
            }

            if (fireBreathWarning) {
                turnMsg.innerHTML += `<br><div style="border:2px solid #d32f2f; background:#ffebee; padding:5px; margin-top:5px; animation: pulse-highlight 1s infinite;"><span style="color:#d32f2f; font-weight:bold; font-size:16px;">⚠ 警戒：敵は火炎放射を準備しています！ ⚠</span></div>`;
            }
            if (lastLionPurgeWarning) {
                turnMsg.innerHTML += `<br><div style="border:2px solid #6a1b9a; background:#f3e5f5; padding:5px; margin-top:5px; animation: pulse-highlight 1s infinite;"><span style="color:#6a1b9a; font-weight:bold; font-size:16px;">⚠ 次元の裁き：次のターン、ラストライオンの列と行の味方ゴマが消滅します！ ⚠</span></div>`;
            }
            // ヘルパーアクティブ中の操作ガイド
            const helperGuides = {
                'eradicate': '💥 消したい<b>相手の駒</b>をクリック（ライオン以外）',
                'phoenix':   '🔥 進化させる<b>自分のひよこ</b>をクリック'
            };
            if (helperActiveMode && helperGuides[helperActiveMode]) {
                turnMsg.innerHTML += `<div class="helper-instruction">${helperGuides[helperActiveMode]}</div>`;
            }
        }
    }
}

function isPhoenixLionOnBoard() {
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            // hasRevived === false = まだ復活前 → ❤マスを表示する
            if (board[r][c] && board[r][c].isPhoenixLion && !board[r][c].hasRevived) return true;
        }
    }
    return false;
}

// --- Visual Effects ---
function playCaptureEffect(r, c) {
    const boardEl = document.getElementById('board');
    const cells = boardEl.querySelectorAll('.cell');
    const index = r * boardCols + c;
    const cell = cells[index];
    if (cell) {
        const effect = document.createElement('div');
        effect.className = 'capture-effect';
        cell.appendChild(effect);
        setTimeout(() => {
            if (effect.parentNode) effect.parentNode.removeChild(effect);
        }, 300);
    }
    // 画面揺れを一時的に無効化
    // const container = document.getElementById('gameContainer');
    // container.classList.remove('shake');
    // void container.offsetWidth; // trigger reflow
    // container.classList.add('shake');
}

function playPromotionEffect(r, c) {
    const boardEl = document.getElementById('board');
    const cells = boardEl.querySelectorAll('.cell');
    const index = r * boardCols + c;
    const cell = cells[index];
    if (cell) {
        const effect = document.createElement('div');
        effect.className = 'promotion-aura';
        cell.appendChild(effect);
        setTimeout(() => {
            if (effect.parentNode) effect.parentNode.removeChild(effect);
        }, 400);
    }
}

function animatePieceMove(from, to, onComplete) {
    const boardEl = document.getElementById('board');
    const cells = boardEl.querySelectorAll('.cell');
    const fromIndex = from.r * boardCols + from.c;
    const toIndex = to.r * boardCols + to.c;
    
    const fromCell = cells[fromIndex];
    const toCell = cells[toIndex];
    
    if (!fromCell || !toCell) {
        if (onComplete) onComplete();
        return;
    }

    const img = fromCell.querySelector('img');
    if (!img) {
        if (onComplete) onComplete();
        return;
    }

    // Clone the image for animation
    const clone = img.cloneNode(true);
    clone.className = 'animating-piece';
    if (img.classList.contains('player2-piece')) {
        clone.classList.add('player2-piece');
    }
    
    // Get positions relative to the board
    const boardRect = boardEl.getBoundingClientRect();
    const fromRect = fromCell.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();
    
    // Position absolute on the board
    clone.style.position = 'absolute';
    clone.style.width = '95px';
    clone.style.height = '95px';
    
    // Calculate exact center position
    const offsetX = (110 - 95) / 2;
    const offsetY = (110 - 95) / 2;
    
    clone.style.left = (fromRect.left - boardRect.left + offsetX) + 'px';
    clone.style.top = (fromRect.top - boardRect.top + offsetY) + 'px';
    
    // Hide original image
    img.style.opacity = '0';
    
    // Ensure board is relative for absolute positioning of the clone
    if (getComputedStyle(boardEl).position === 'static') {
        boardEl.style.position = 'relative';
    }
    boardEl.appendChild(clone);
    
    // Trigger animation
    requestAnimationFrame(() => {
        clone.style.left = (toRect.left - boardRect.left + offsetX) + 'px';
        clone.style.top = (toRect.top - boardRect.top + offsetY) + 'px';
    });

    setTimeout(() => {
        if (clone.parentNode) clone.parentNode.removeChild(clone);
        if (onComplete) onComplete();
    }, 250); // Matches CSS transition duration
}
