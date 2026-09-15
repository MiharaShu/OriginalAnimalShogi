function showEncyclopedia() {
    hideAllScreens();
    const screen = document.getElementById('encyclopediaScreen');
    screen.style.display = 'flex';
    
    renderPieceList();
}

function renderPieceList() {
    const listContainer = document.getElementById('pieceList');
    listContainer.innerHTML = '';

    Object.keys(PIECES).forEach(type => {
        const piece = PIECES[type];
        const card = document.createElement('div');
        card.className = 'piece-card';
        card.dataset.type = type; // バグ修正: 名前文字列一致の代わりに dataset.type で管理
        card.onclick = () => selectEncyclopediaPiece(type);

        card.innerHTML = `
            <img src="${piece.image}" alt="${piece.nameJP}">
            <div class="piece-name">${piece.nameJP}</div>
        `;
        listContainer.appendChild(card);
    });

    const firstType = Object.keys(PIECES)[0];
    selectEncyclopediaPiece(firstType);
}

function selectEncyclopediaPiece(type) {
    // バグ修正: dataset.type で判定（名前文字列一致は同名駒がありうるため不安定）
    document.querySelectorAll('.piece-card').forEach(card => {
        card.classList.toggle('active', card.dataset.type === type);
    });

    const piece = PIECES[type];
    const detailContainer = document.getElementById('pieceDetail');
    
    detailContainer.innerHTML = `
        <div class="detail-header">
            <img src="${piece.image}" alt="${piece.nameJP}" class="detail-img">
            <h2 class="detail-title">${piece.nameJP}</h2>
        </div>
        <p class="detail-desc">${piece.description}</p>
        <div class="movement-preview-container">
            <div class="movement-label">うごきかた</div>
            <div style="font-size:11px; color:#888; text-align:center; margin-bottom:4px;">↑ 相手側</div>
            <div id="movementGrid" class="movement-grid"></div>
            <div style="font-size:11px; color:#888; text-align:center; margin-top:4px;">↓ 自分側</div>
        </div>
    `;
    
    renderMovementGrid(type);
}

function renderMovementGrid(type) {
    const grid = document.getElementById('movementGrid');
    const piece = PIECES[type];
    
    // Create 5x5 grid (center is piece position)
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    grid.style.gap = '2px';
    grid.style.width = '150px';
    grid.style.height = '150px';
    grid.style.margin = '10px auto';
    grid.style.background = '#ccc';
    grid.style.border = '2px solid #666';
    
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.style.width = '100%';
            cell.style.height = '100%';
            cell.style.background = '#fff';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '12px';
            
            const relR = r - 2;
            const relC = c - 2;
            
            if (relR === 0 && relC === 0) {
                // Piece itself
                const img = document.createElement('img');
                img.src = piece.image;
                img.style.width = '80%';
                cell.appendChild(img);
                cell.style.background = '#e3f2fd';
            } else if (isMovePossible(type, relR, relC)) {
                // Valid move
                cell.style.background = '#ffeb3b';
                cell.textContent = '●';
                cell.style.color = '#f44336';
            }
            
            grid.appendChild(cell);
        }
    }
}

function isMovePossible(type, relR, relC) {
    const piece = PIECES[type];
    
    // Note: relR is target board row diff, relC is col diff
    // In our logic, y is vertical (relR), x is horizontal (relC)
    // Positive relR means moving down (backwards for player 1)
    
    // Standard moves
    if (piece.moves) {
        if (piece.moves.some(m => m[1] === relR && m[0] === relC)) return true;
    }
    
    // Sliding moves
    if (piece.sliding) {
        if (piece.sliding.some(s => {
            // Check if relR/relC is multiple of s[1]/s[0]
            if (s[0] === 0) { // Vertical sliding
                return relC === 0 && (relR / s[1] > 0);
            }
            if (s[1] === 0) { // Horizontal sliding
                return relR === 0 && (relC / s[0] > 0);
            }
            // Diagonal sliding
            return (relR / s[1] === relC / s[0]) && (relR / s[1] > 0);
        })) return true;
    }
    
    // Jumps
    if (piece.jumps) {
        if (piece.jumps.some(j => j[1] === relR && j[0] === relC)) return true;
    }
    
    return false;
}

function showAncientDocument() {
    hideAllScreens();
    const docScreen = document.getElementById('ancientDocumentScreen');
    if (docScreen) {
        docScreen.style.display = 'block';
    }
}
