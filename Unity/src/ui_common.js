// --- Shared UI Components & Utilities ---

function showBoardMessage(text, duration = 1000) {
    const overlay = document.getElementById('boardMessageOverlay');
    overlay.textContent = text;
    overlay.style.display = 'block';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, duration);
}

function showQuickNotice(text, duration = 2400) {
    showBoardMessage(text, duration);
}

function hideAllScreens() {
    const screens = [
        'titleScreen', 'gameContainer', 'storyScreen', 'aiLevelScreen',
        'gachaScreen', 'encyclopediaScreen', 'guideScreen', 'ancientDocumentScreen'
    ];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showGuideScreen() {
    hideAllScreens();
    const guide = document.getElementById('guideScreen');
    if (guide) guide.style.display = 'flex';
}

// ===== カスタムモーダルユーティリティ =====

/**
 * OK押下まで待つモーダル。onClose に次の処理を渡す。
 * @param {string} body    - HTML文字列
 * @param {string} title   - タイトル文字列
 * @param {Function} onClose - OKボタン押下後のコールバック
 */
function showModal(body, title = '', onClose = null) {
    const overlay = document.getElementById('customModalOverlay');
    document.getElementById('customModalTitle').innerHTML = title;
    document.getElementById('customModalBody').innerHTML = body;
    document.getElementById('customModalInput').style.display = 'none';
    document.getElementById('customModalClose').style.display = 'inline-block';
    document.getElementById('customModalSubmit').style.display = 'none';
    overlay._onClose = onClose;
    overlay._onSubmit = null;
    overlay.classList.add('active');
    document.getElementById('customModalClose').focus();
}

/** テキスト入力付きモーダル（devUnlock 等向け）*/
function showPromptModal(title, placeholder, onSubmit) {
    const overlay = document.getElementById('customModalOverlay');
    document.getElementById('customModalTitle').innerHTML = title;
    document.getElementById('customModalBody').innerHTML = '';
    const input = document.getElementById('customModalInput');
    input.type = 'password';
    input.placeholder = placeholder || '';
    input.value = '';
    input.style.display = 'block';
    document.getElementById('customModalClose').style.display = 'none';
    document.getElementById('customModalSubmit').style.display = 'inline-block';
    overlay._onClose = null;
    overlay._onSubmit = onSubmit;
    overlay.classList.add('active');
    setTimeout(() => input.focus(), 80);
}

/** モーダルを閉じ、onClose コールバックを実行 */
function closeModal() {
    const overlay = document.getElementById('customModalOverlay');
    overlay.classList.remove('active');
    if (typeof overlay._onClose === 'function') {
        const cb = overlay._onClose;
        overlay._onClose = null;
        cb();
    }
}

/** 入力モーダルの送信 */
function submitModal() {
    const overlay = document.getElementById('customModalOverlay');
    const val = document.getElementById('customModalInput').value;
    overlay.classList.remove('active');
    if (typeof overlay._onSubmit === 'function') {
        const cb = overlay._onSubmit;
        overlay._onSubmit = null;
        cb(val);
    }
}
