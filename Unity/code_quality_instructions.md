# どうぶつ将棋 コード品質改善 — 実行指示書

> **対象プロジェクト**: `g:\マイドライブ\部活動\Unity`
> **作成日**: 2026-07-28
> **作成者**: Antigravity (Claude Opus 4.6)
> **実行者**: 別AIモデル

> [!CAUTION]
> この指示書に含まれる変更はすべて「コード品質・構造の改善」です。ゲームの挙動・見た目を変えることは意図していません。変更後は必ず検証計画に従って動作確認を行ってください。

---

## 概要

| Phase | 内容 | 対象ファイル |
|---|---|---|
| 1 | CSS分割ファイルの修復 | `css/tutorial.css`, `css/gacha.css`, `css/encyclopedia.css`, `css/animations.css`, `css/helpers.css`, `css/modal.css`, `css/game.css` |
| 2 | デッドCSS削除 | `style.css` |
| 3 | ai.js のネストバグ修正 | `ai.js` |
| 4 | HTMLインラインスタイルの外部化 | `DoubutuShogi.html`, 各CSSファイル |

---

## Phase 1: CSS分割ファイルの修復

### 背景

`style.css`（896行の旧一体型CSS）を `css/` ディレクトリに分割した際、ファイル境界を不正確に切断しており、**CSSルールが途中で切れている・閉じ括弧が欠損している**問題が多数あります。以下、ファイルごとに修正内容を記載します。

---

### 1-1. `src/css/tutorial.css` の修正

**現在の内容（壊れている）:**
```css
    z-index: 50;
    text-align: center;
    pointer-events: none;
    white-space: nowrap;
    animation: fadeIn 0.3s ease;
}

/* --- Tutorial Highlight --- */
.tutorial-highlight {
    ...（以下正常）
```

先頭の6行は `#boardMessageOverlay` の末尾部分が紛れ込んでいます（本来は game.css に含まれるべき内容）。

**修正後の内容（ファイル全体を以下に置換）:**
```css
/* --- Tutorial Highlight --- */
.tutorial-highlight {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 3px solid #f2c94c;
    border-radius: 4px;
    animation: pulse-highlight 1s infinite;
    pointer-events: none;
    z-index: 3;
}

.tutorial-arrow {
    position: absolute;
    font-size: 28px;
    animation: bounce-arrow 0.8s infinite;
    pointer-events: none;
    z-index: 4;
    left: 50%;
    transform: translateX(-50%);
}

/* --- Tutorial Panel (Restructured) --- */
.tutorial-panel {
    width: 100%;
    max-width: 500px;
    background-color: #fff9e6;
    border: 3px solid #f2c94c;
    border-radius: 12px;
    padding: 15px;
    margin: 0 auto 20px auto;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease-out;
}

.tutorial-msg {
    font-size: 16px;
    color: #333;
    line-height: 1.5;
    font-weight: bold;
    margin-bottom: 12px;
}

.tutorial-btn {
    background-color: #f2c94c;
    color: #333;
    border: none;
    padding: 8px 25px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tutorial-btn:hover {
    background-color: #e2b93c;
    transform: translateY(-2px);
}
```

---

### 1-2. `src/css/gacha.css` の修正

**問題点:**
- 先頭に `.tutorial-btn:hover` が紛れ込み（tutorial.css に統合したので削除）
- `@keyframes pulse-button` の `100%` 行が欠落
- `@keyframes slideDown` の `to` 行が欠落

**修正後の内容（ファイル全体を以下に置換）:**
```css
/* --- Gacha Stock UI --- */
.gacha-stock-area {
    margin-top: 20px;
    background: linear-gradient(135deg, #f3e5f5, #e1f5fe);
    border: 2px solid #e040fb;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 10px rgba(224, 64, 251, 0.15);
    width: 100%;
}

.stock-title {
    font-size: 12px;
    font-weight: 800;
    color: #7b1fa2;
    text-transform: uppercase;
}

.stock-count-wrap {
    display: flex;
    align-items: baseline;
    gap: 2px;
}

.stock-num {
    font-size: 28px;
    font-weight: 900;
    color: #e040fb;
}

.stock-max {
    font-size: 14px;
    color: #888;
}

.gacha-use-btn {
    background: linear-gradient(135deg, #e040fb, #7c4dff);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 15px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 3px 8px rgba(224, 64, 251, 0.3);
    width: 100%;
}

.gacha-use-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
}

.pulse-animation {
    animation: pulse-button 1.5s infinite;
}

@keyframes pulse-button {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(224, 64, 251, 0.7); }
    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(224, 64, 251, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(224, 64, 251, 0); }
}

@keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
```

---

### 1-3. `src/css/encyclopedia.css` の修正

**問題点:**
- 先頭にレスポンシブの `.helpers-container` ルール断片と `@media` 閉じ括弧が紛れ込み

**修正後の内容（ファイル全体を以下に置換）:**
```css
/* --- Encyclopedia Styles --- */
.piece-card {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    background: #f9f9f9;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.piece-card:hover {
    background: #f1f8e9;
    transform: translateX(5px);
}

.piece-card.active {
    background: #e1f5fe;
    border-color: #2196F3;
}

.piece-card img {
    width: 40px;
    height: 40px;
    margin-right: 12px;
}

.piece-name {
    font-size: 16px;
    font-weight: bold;
}

.detail-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
}

.detail-img {
    width: 80px;
    height: 80px;
}

.detail-title {
    font-size: 28px;
    color: #333;
}

.detail-desc {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
}

.movement-preview-container {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 12px;
    text-align: center;
}

.movement-label {
    font-size: 14px;
    font-weight: bold;
    color: #888;
    margin-bottom: 10px;
}

.movement-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    width: 200px;
    height: 200px;
    margin: 0 auto;
}
```

---

### 1-4. `src/css/animations.css` の修正

**問題点:**
- `bounce-arrow` の `50%` 行が欠落（ファイル末尾で途切れ）

**修正後の内容（ファイル全体を以下に置換）:**
```css
/* --- Gacha --- */
#gachaScreen {
    text-align: center;
}

/* --- Animations --- */
@keyframes pulse-highlight {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 8px rgba(242, 201, 76, 0.6);
    }
    50% {
        opacity: 0.5;
        box-shadow: 0 0 16px rgba(242, 201, 76, 0.9);
    }
}

@keyframes pulse-text {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes bounce-arrow {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-8px); }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
```

---

### 1-5. `src/css/helpers.css` の修正

**問題点:**
- `.helper-btn:hover` が2回定義（L30-34 と L45-48）→ 統合
- `#customModalClose:hover` が混入（→ modal.css へ移動）
- `.helper-instruction` が閉じ括弧なしで途切れ

**修正後の内容（ファイル全体を以下に置換）:**
```css
.reset-btn:hover {
    opacity: 0.9;
    transform: scale(1.02);
}

/* --- Helper Buttons --- */
.helpers-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.helper-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 14px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 10px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: #333;
    transition: all 0.2s ease;
    text-align: center;
    line-height: 1.3;
    position: relative;
}

.helper-btn:hover {
    border-color: #8bc34a;
    background: #f1f8e9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.helper-btn.used {
    filter: grayscale(1) invert(0.1);
    opacity: 0.4;
    background: #e0e0e0 !important;
    cursor: not-allowed;
    text-decoration: line-through;
    pointer-events: none;
    border-color: #999 !important;
}

/* ===== ヘルパーボタン ツールチップ ===== */
.helper-btn::after {
    content: attr(data-tooltip);
    display: block;
    position: absolute;
    left: 110%;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(30, 30, 30, 0.92);
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 400;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s ease;
    z-index: 200;
    line-height: 1.5;
    max-width: 200px;
    white-space: normal;
    text-decoration: none;
}

.helper-btn:hover::after {
    opacity: 1;
}

/* ===== ヘルパー操作ガイド表示 ===== */
.helper-instruction {
    font-size: 13px;
    color: #e65100;
    background: #fff3e0;
    border: 1px solid #ffb74d;
    border-radius: 6px;
    padding: 5px 10px;
    margin-top: 6px;
    animation: pulse-text 1.5s infinite;
    text-align: center;
}
```

---

### 1-6. `src/css/modal.css` の修正

**問題点:**
- `#customModalClose` が閉じ括弧なし（`box-shadow` 宣言が欠落）
- `#customModalClose:hover` が helpers.css に誤配置されていた → こちらに統合

**修正後の内容（ファイル全体を以下に置換）:**
```css
/* ===== カスタムモーダル ===== */
#customModalOverlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 9000;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(4px);
    animation: fadeInOverlay 0.2s ease;
}

#customModalOverlay.active {
    display: flex;
}

@keyframes fadeInOverlay {
    from { opacity: 0; }
    to   { opacity: 1; }
}

#customModalBox {
    background: rgba(255, 255, 255, 0.97);
    border-radius: 20px;
    padding: 32px 36px;
    max-width: 480px;
    width: 90%;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
    animation: modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: center;
}

@keyframes modalPop {
    from { transform: scale(0.85); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
}

#customModalTitle {
    font-size: 22px;
    font-weight: 800;
    color: #2e3d23;
    margin-bottom: 14px;
}

#customModalBody {
    font-size: 16px;
    color: #444;
    line-height: 1.65;
    margin-bottom: 24px;
}

#customModalClose {
    background: linear-gradient(135deg, #56ab2f, #a8e063);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 36px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(86, 171, 47, 0.35);
}

#customModalClose:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(86, 171, 47, 0.5);
}
```

---

### 1-7. `src/css/game.css` の修正

**問題点:**
- `.reset-btn` の `box-shadow` 宣言が欠落（L191-192 で途切れ）
- `#boardMessageOverlay` の `font-weight`, `z-index`, `pointer-events`, `white-space` が欠落（L211-212 で途切れ）
- `.helper-icon` が game.css に混入（helpers.css に移動するか残すか → ここでは game.css に残す。機能的に問題ないため）

**修正後の内容（ファイル全体を以下に置換）:**
```css
/* --- Game Container --- */
.game-container {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    width: 100%;
    max-width: 1200px;
    position: relative;
    min-height: 90vh;
}

.main-layout {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 40px;
    width: 100%;
}

/* --- Side Panels --- */
.side-panel {
    min-width: 180px;
    max-width: 250px;
}

/* --- Center Panel --- */
.center-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* --- Board --- */
.board {
    display: grid;
    grid-template-columns: repeat(3, 110px);
    grid-template-rows: repeat(4, 110px);
    gap: 3px;
    background: #4e342e; /* より自然な木の色 */
    border: 6px solid #3e2723;
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

/* 5行特殊盤面（真レベル5：ラストライオン） */
.board.board-5rows {
    background: linear-gradient(135deg, #1a0033, #2d004d, #1a0033);
    border-color: #6a1b9a;
    box-shadow: 0 0 30px rgba(106, 27, 154, 0.5), 0 8px 25px rgba(0, 0, 0, 0.4);
}

.cell {
    width: 110px;
    height: 110px;
    background: linear-gradient(145deg, #ffecb3, #ffe082);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: background-color 0.15s ease;
    border-radius: 2px;
}

.cell img {
    width: 95px !important;
    height: 95px !important;
}

.cell:hover {
    background: linear-gradient(145deg, #fff8e1, #ffecb3);
}

.cell.selected {
    background: linear-gradient(145deg, #a5d6a7, #81c784) !important;
    box-shadow: inset 0 0 8px rgba(56, 142, 60, 0.5);
}

.cell.valid-move {
    background: radial-gradient(circle, rgba(33, 150, 243, 0.4) 30%, transparent 70%), linear-gradient(145deg, #ffecb3, #ffe082);
}

.cell.valid-move::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: rgba(33, 150, 243, 0.5);
    border-radius: 50%;
}

/* --- Player 2 Piece Flip --- */
.player2-piece {
    transform: rotate(180deg);
}

/* --- Hands --- */
.hand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(5px);
    border-radius: 12px;
    min-height: 80px;
    min-width: 90px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.hand-label {
    font-size: 11px;
    font-weight: 700;
    color: #666;
    text-align: center;
    margin-bottom: 4px;
    white-space: nowrap;
}

.hand-piece {
    width: 75px;
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff9c4;
    border: 2px solid #f9a825;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.hand-piece:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.hand-piece.selected {
    background: #a5d6a7 !important;
    border-color: #388e3c !important;
    box-shadow: 0 0 10px rgba(56, 142, 60, 0.4);
}

/* --- Turn Display --- */
.turn-display {
    font-size: 24px;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 8px;
    text-align: center;
    min-width: 200px;
}

.p1-color {
    color: #1565c0;
}

.p2-color {
    color: #c62828;
}

.ai-indicator {
    color: #c62828;
    animation: pulse-text 1s infinite;
}

/* --- Subtitle --- */
.subtitle {
    font-size: 13px;
    color: #888;
    text-align: center;
}

/* --- Reset Button --- */
.reset-btn {
    padding: 10px 24px;
    font-size: 15px;
    font-weight: 600;
    /* 森テーマ：葉の緑 */
    background-color: #689f38;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(104, 159, 56, 0.3);
}

.helper-icon {
    font-size: 24px;
    margin-bottom: 4px;
}

/* --- Board Message Overlay --- */
#boardMessageOverlay {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 20px;
    font-weight: 700;
    z-index: 50;
    text-align: center;
    pointer-events: none;
    white-space: nowrap;
    animation: fadeIn 0.3s ease;
}

/* --- Responsive --- */
@media (max-width: 900px) {
    .game-container {
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .main-layout {
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .side-panel {
        flex-direction: row !important;
        max-width: 100%;
        justify-content: center;
    }

    .hand {
        flex-direction: row;
        flex-wrap: wrap;
        min-height: auto;
    }

    .helpers-container {
        flex-direction: row !important;
        flex-wrap: wrap;
        justify-content: center;
    }
}
```

---

## Phase 2: デッドCSS削除

### `src/style.css` を削除する

このファイルはHTMLから `<link>` で読み込まれていません（`DoubutuShogi.html` は `css/*.css` のみを参照）。完全なデッドファイルです。

**操作**: `src/style.css` を削除

---

## Phase 3: ai.js のネストバグ修正

### 問題の詳細

`src/ai.js` の `executeAIMove()` 関数内で、「ラストライオン: 次元の裁き（TrueStory Stage 4）」の処理ブロック（L206-268）が、「闇のライオン・火炎放射」の `if (darkLionCol !== -1)` ブロックの**内部**にネストされています。

Stage 4 ではダークライオン（`isDarkLion`）は配置されないため、`darkLionCol` は常に `-1` となり、**次元の裁きが絶対に発動しません**。

### 修正内容

`src/ai.js` の `executeAIMove()` 関数内、**L144行目付近〜L269行目付近**の構造を修正します。

**現在のコード構造（壊れている）:**
```javascript
    if (gameMode === 'TrueStory') {
        // ダークライオン検索ループ (L131-142)
        ...

        if (darkLionCol !== -1) {              // ← L144
            // 火炎放射処理 (L146-203)
            ...
            return;
        }                                      // ← この閉じ括弧がない！

    // --- ラストライオン処理 (L207-268) ---   // ← darkLionCol !== -1 の中に入ってしまっている
    if (gameMode === 'TrueStory' && currentStage === 4) {
        ...
    }
    }                                          // ← L269: gameMode === 'TrueStory' の閉じ括弧
```

**修正後のコード構造:**
```javascript
    if (gameMode === 'TrueStory') {
        // ダークライオン検索ループ
        ...

        if (darkLionCol !== -1) {
            // 火炎放射処理
            ...
            return;
        }
        }  // ← darkLionCol !== -1 の閉じ括弧を追加

        // --- ラストライオン: 次元の裁き（TrueStory Stage 4）---
        if (gameMode === 'TrueStory' && currentStage === 4) {
            ...
        }
    }  // ← gameMode === 'TrueStory' の閉じ括弧
```

**具体的には、`ai.js` の以下の箇所を変更します:**

L203-L269を以下のように置換します。現在のコード:

```javascript
                return;
            }
        }

    // --- ラストライオン: 次元の裁き（TrueStory Stage 4）---
    if (gameMode === 'TrueStory' && currentStage === 4) {
```

を以下に変更:

```javascript
                return;
            }
        }
    }

    // --- ラストライオン: 次元の裁き（TrueStory Stage 4）---
    if (gameMode === 'TrueStory' && currentStage === 4) {
```

そして、L268-269の現在のコード:

```javascript
    }
    }
```

を以下に変更:

```javascript
    }
```

> [!WARNING]
> この修正はブレース（`{}`）の対応を変えるため、注意深く行ってください。修正後、ブラウザのコンソールでJavaScriptエラーが出ないことを確認してください。

---

## Phase 4: HTMLインラインスタイルの外部化

### 方針

`DoubutuShogi.html` に散在するインラインスタイル（`style="..."` 属性）を、新しいCSSクラスとして外部CSSファイルに移動します。

### 4-1. 新しいCSSファイルの作成

**新規作成**: `src/css/layout.css`

このファイルに、HTMLから抽出したインラインスタイルをクラスとして定義します。

```css
/* ===== Layout utilities extracted from inline styles ===== */

/* --- Story Screen --- */
.story-stage-title {
    color: #9C27B0;
    margin-bottom: 5px;
}

.story-enemy-name {
    color: #666;
    margin-top: 0;
    margin-bottom: 20px;
}

.story-condition-area {
    font-size: 16px;
    color: #e65100;
}

/* --- Helper Selection Area --- */
.helper-selection-area {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 15px;
    border-top: 1px solid #ddd;
    padding-top: 15px;
}

.helper-selection-title {
    font-weight: bold;
    margin-bottom: 10px;
}

.helper-pool {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
}

.helper-selection-status {
    margin-top: 10px;
    font-size: 12px;
    color: #666;
}

/* --- Story Action Buttons --- */
.story-buttons-row {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.story-action-btn {
    background-color: #4CAF50;
    width: auto;
    font-size: 20px;
}

.story-alt-btn {
    background-color: #2196F3;
    width: auto;
    font-size: 20px;
}

.story-back-btn {
    background-color: #777;
    width: auto;
    font-size: 20px;
}

/* --- AI Level Screen --- */
.ai-level-title {
    color: #333;
    margin-bottom: 20px;
}

.ai-level-list {
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* --- Game Screen Layout --- */
.side-panel-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.center-panel-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.game-title {
    margin: 0 0 5px 0;
    font-size: 36px;
}

/* --- Endless Status Bar --- */
.endless-status-bar {
    display: none;
    text-align: center;
    margin-bottom: 5px;
}

.endless-floor-label {
    font-size: 14px;
    font-weight: bold;
}

.endless-hp-track {
    width: 200px;
    height: 10px;
    background: #ddd;
    border-radius: 5px;
    margin: 5px auto;
    overflow: hidden;
}

.endless-hp-fill {
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, #f44336, #ffeb3b);
    transition: width 0.3s;
}

/* --- Turn Display --- */
.turn-display-main {
    margin: 0 0 10px 0;
}

.turn-label-p2 {
    display: none;
    margin: 0;
    padding: 10px 20px;
    text-align: center;
}

.turn-label-p1 {
    margin: 0;
    padding: 10px 20px;
    text-align: center;
}

/* --- Board Wrapper --- */
.board-wrapper {
    position: relative;
}

/* --- Game Buttons --- */
.game-buttons-area {
    margin-top: 20px;
}

.btn-back-to-title {
    background-color: #2196F3;
    margin-left: 10px;
}

/* --- Helpers Container --- */
.helpers-panel {
    display: none;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
}

/* --- Message Board Overlay --- */
.message-board {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px 40px;
    border-radius: 10px;
    font-size: 24px;
    font-weight: bold;
    z-index: 100;
    text-align: center;
    pointer-events: none;
}

/* --- Gacha Screen --- */
.gacha-screen-inner {
    max-width: 500px;
}

.gacha-title {
    color: #e040fb;
    margin-bottom: 5px;
}

.gacha-desc {
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
}

.gacha-result-display {
    font-size: 70px;
    min-height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse-highlight 1s infinite;
}

.gacha-result-name {
    font-size: 22px;
    font-weight: bold;
    color: #333;
    margin: 10px 0;
}

.gacha-result-rarity {
    font-size: 14px;
    margin-bottom: 20px;
}

.gacha-roll-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
}

.gacha-roll-btn {
    background: linear-gradient(135deg, #e040fb, #7c4dff);
    color: white;
    font-size: 22px;
    padding: 14px 40px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(224,64,251,0.4);
    transition: all 0.2s;
}

.gacha-next-btn {
    display: none;
    background-color: #4CAF50;
    font-size: 18px;
    padding: 10px 30px;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
}

.gacha-rates-box {
    margin-top: 20px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
    font-size: 12px;
    color: #888;
}

/* --- Encyclopedia Screen --- */
.encyclopedia-screen-inner {
    max-width: 800px;
    height: 90vh;
}

.encyclopedia-title {
    color: #2196F3;
    margin-bottom: 10px;
}

.encyclopedia-layout {
    display: flex;
    gap: 20px;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.encyclopedia-list {
    flex: 1;
    overflow-y: auto;
    background: #fff;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ddd;
}

.encyclopedia-detail {
    flex: 2;
    background: #fff;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #ddd;
    text-align: left;
}

/* --- Guide Screen --- */
.guide-screen-inner {
    max-width: 800px;
    height: 90vh;
    overflow-y: auto;
}

.guide-title {
    color: #4CAF50;
    margin-bottom: 20px;
}

.guide-content {
    text-align: left;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.guide-section-gacha {
    color: #ff9800;
    border-bottom: 2px solid #ff9800;
    padding-bottom: 5px;
}

.guide-section-helper {
    color: #2196F3;
    border-bottom: 2px solid #2196F3;
    padding-bottom: 5px;
    margin-top: 30px;
}

.guide-rates-list {
    font-size: 14px;
    color: #555;
    background: #f9f9f9;
    padding: 10px 30px;
    border-radius: 8px;
}

.guide-helper-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 14px;
    background: #fff;
}

.guide-helper-table th {
    background-color: #e3f2fd;
    border: 1px solid #bbdefb;
    padding: 10px;
}

.guide-helper-table td {
    border: 1px solid #eee;
    padding: 10px;
}

.guide-helper-table .col-name {
    width: 35%;
}

.guide-back-btn {
    background-color: #777;
    margin-top: 30px;
}

/* --- Modal Input --- */
.modal-input {
    display: none;
    margin-bottom: 16px;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1.5px solid #ccc;
    font-size: 16px;
    width: 100%;
    box-sizing: border-box;
    outline: none;
}

.modal-buttons-row {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.modal-submit-btn {
    display: none;
    background: linear-gradient(135deg, #2196F3, #1565c0);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 36px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
}

/* --- Dev Unlock --- */
.dev-unlock-area {
    text-align: center;
    margin-top: 15px;
}

.dev-unlock-link {
    font-size: 12px;
    color: #aaa;
    cursor: pointer;
    text-decoration: underline;
}
```

### 4-2. HTMLへのCSS読み込み追加

`DoubutuShogi.html` の `<head>` 内に以下を追加:

```html
<link rel="stylesheet" href="css/layout.css">
```

他の `<link>` タグの後（`css/animations.css` の後）に追加してください。

### 4-3. HTMLのインラインスタイル置換

`DoubutuShogi.html` の各要素から `style="..."` を削除し、代わりに上記で定義したCSSクラスを `class` 属性に追加します。

> [!IMPORTANT]
> 以下の一覧は主要な置換対象です。すべてを網羅しています。各要素のIDやその他の属性は変更しないでください。

#### ストーリー画面（L92-119）

**Before:**
```html
<h2 id="storyStageTitle" style="color: #9C27B0; margin-bottom: 5px;">ステージ 1</h2>
<h3 id="storyEnemyName" style="color: #666; margin-top: 0; margin-bottom: 20px;">対戦相手の名前</h3>
```
**After:**
```html
<h2 id="storyStageTitle" class="story-stage-title">ステージ 1</h2>
<h3 id="storyEnemyName" class="story-enemy-name">対戦相手の名前</h3>
```

---

**Before:**
```html
<div id="helperSelectionArea" style="display: none; flex-direction: column; align-items: center; width: 100%; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
    <p id="helperSelectionTitle" style="font-weight: bold; margin-bottom: 10px;">助っ人を選択（最大3つ）</p>
    <div id="helperPool" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
```
**After:**
```html
<div id="helperSelectionArea" class="helper-selection-area">
    <p id="helperSelectionTitle" class="helper-selection-title">助っ人を選択（最大3つ）</p>
    <div id="helperPool" class="helper-pool">
```

---

**Before:**
```html
<div style="margin-top: 10px; font-size: 12px; color: #666;" id="helperSelectionStatus">
```
**After:**
```html
<div class="helper-selection-status" id="helperSelectionStatus">
```

---

**Before:**
```html
<div style="display: flex; gap: 10px; margin-top: 20px;">
    <button class="mode-btn" id="storyActionBtn"
        style="background-color: #4CAF50; width: auto; font-size: 20px;"
        onclick="startStoryBattle()">勝負開始！</button>
    <button class="mode-btn" id="storyAltBtn"
        style="background-color: #2196F3; width: auto; font-size: 20px; display: none;">
        別の選択肢
    </button>
    <button class="mode-btn" style="background-color: #777; width: auto; font-size: 20px;"
        onclick="showTitleScreen()">タイトルへ</button>
</div>
```
**After:**
```html
<div class="story-buttons-row">
    <button class="mode-btn story-action-btn" id="storyActionBtn"
        onclick="startStoryBattle()">勝負開始！</button>
    <button class="mode-btn story-alt-btn" id="storyAltBtn"
        style="display: none;">
        別の選択肢
    </button>
    <button class="mode-btn story-back-btn"
        onclick="showTitleScreen()">タイトルへ</button>
</div>
```

> [!NOTE]
> `storyAltBtn` の `display: none` はJSで動的に切り替えるため、インラインに残します。

---

#### AIレベル選択画面（L122-132）

**Before:**
```html
<h2 style="color: #333; margin-bottom: 20px;">AIのレベルを選んでください</h2>
<div style="display: flex; flex-direction: column; align-items: center;">
```
**After:**
```html
<h2 class="ai-level-title">AIのレベルを選んでください</h2>
<div class="ai-level-list">
```

---

#### ゲーム画面（L134-242）

**Before:**
```html
<div class="game-container" id="gameContainer" style="display:none; flex-direction: column;">
```
**After:**
```html
<div class="game-container" id="gameContainer">
```
> `display:none` と `flex-direction: column` は既に `.game-container` クラスで定義済みです。

---

**Before:**
```html
<div class="side-panel" style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
```
**After（2箇所とも）:**
```html
<div class="side-panel side-panel-layout">
```

---

**Before:**
```html
<div class="turn-display p2-color" id="turnLabel2"
    style="display:none; margin: 0; padding: 10px 20px; text-align: center;">Player 2 (AI) の番</div>
```
**After:**
```html
<div class="turn-display p2-color turn-label-p2" id="turnLabel2">Player 2 (AI) の番</div>
```

---

**Before:**
```html
<div class="center-panel" style="display: flex; flex-direction: column; align-items: center;">
    <h1 style="margin: 0 0 5px 0; font-size: 36px;">どうぶつ将棋</h1>
```
**After:**
```html
<div class="center-panel center-panel-layout">
    <h1 class="game-title">どうぶつ将棋</h1>
```

---

**Before:**
```html
<div id="endlessStatusBar" style="display:none; text-align:center; margin-bottom: 5px;">
    <div style="font-size:14px; font-weight:bold;">探索中 (B<span id="txtFloor">1</span>F)</div>
    <div style="width:200px; height:10px; background:#ddd; border-radius:5px; margin: 5px auto; overflow: hidden;">
        <div id="hpBar" style="width:100%; height:100%; background:linear-gradient(to right, #f44336, #ffeb3b); transition: width 0.3s;"></div>
    </div>
</div>
```
**After:**
```html
<div id="endlessStatusBar" class="endless-status-bar">
    <div class="endless-floor-label">探索中 (B<span id="txtFloor">1</span>F)</div>
    <div class="endless-hp-track">
        <div id="hpBar" class="endless-hp-fill"></div>
    </div>
</div>
```

---

**Before:**
```html
<div class="turn-display" id="turnDisplay" style="margin: 0 0 10px 0;"></div>
```
**After:**
```html
<div class="turn-display turn-display-main" id="turnDisplay"></div>
```

---

**Before:**
```html
<div style="position: relative;">
```
**After:**
```html
<div class="board-wrapper">
```

---

**Before:**
```html
<div style="margin-top: 20px;">
```
**After:**
```html
<div class="game-buttons-area">
```

---

**Before:**
```html
<button class="reset-btn" style="background-color: #2196F3; margin-left: 10px;"
    onclick="showTitleScreen()">タイトルに戻る</button>
```
**After:**
```html
<button class="reset-btn btn-back-to-title"
    onclick="showTitleScreen()">タイトルに戻る</button>
```

---

**Before:**
```html
<div class="turn-display p1-color" id="turnLabel1"
    style="margin: 0; padding: 10px 20px; text-align: center;">Player 1 (あなた) の番</div>
```
**After:**
```html
<div class="turn-display p1-color turn-label-p1" id="turnLabel1">Player 1 (あなた) の番</div>
```

---

**Before:**
```html
<div class="helpers-container" id="helpersContainer"
    style="display: none; flex-direction: column; gap: 10px; margin-top: 10px;">
```
**After（helpersContainer, level4HelpersContainer の両方）:**
```html
<div class="helpers-container helpers-panel" id="helpersContainer">
```
```html
<div class="helpers-container helpers-panel" id="level4HelpersContainer">
```

---

**Before:**
```html
<div id="messageBoard"
    style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:10px; font-size:24px; font-weight:bold; z-index:100; text-align:center; pointer-events:none;">
</div>
```
**After:**
```html
<div id="messageBoard" class="message-board"></div>
```

---

#### ガチャ画面（L245-268）

**Before:**
```html
<div class="story-screen" id="gachaScreen" style="display: none; max-width: 500px;">
    <h2 id="gachaTitle" style="color: #e040fb; margin-bottom: 5px;">🎰 コマガチャ 🎰</h2>
    <p id="gachaDesc" style="color: #666; font-size: 14px; margin-bottom: 15px;">次のステージの持ち駒を獲得しよう！</p>
    <div id="gachaResult"
        style="font-size: 70px; min-height: 90px; display: flex; align-items: center; justify-content: center; animation: pulse-highlight 1s infinite;">
    </div>
    <div id="gachaResultName" style="font-size: 22px; font-weight: bold; color: #333; margin: 10px 0;"></div>
    <div id="gachaResultRarity" style="font-size: 14px; margin-bottom: 20px;"></div>
    <div id="gachaRollArea"
        style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%;">
        <button class="mode-btn" id="gachaRollBtn" onclick="rollGacha()"
            style="background: linear-gradient(135deg, #e040fb, #7c4dff); color: white; font-size: 22px; padding: 14px 40px; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(224,64,251,0.4); transition: all 0.2s;">
            ガチャを引く！
        </button>
        <button class="mode-btn" id="gachaNextBtn" onclick="proceedAfterGacha()"
            style="display: none; background-color: #4CAF50; font-size: 18px; padding: 10px 30px; border: none; border-radius: 8px; color: white; cursor: pointer;">
            次のステージへ →
        </button>
    </div>
    <div
        style="margin-top: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; text-align: left; width: 100%; box-sizing: border-box; font-size: 12px; color: #888;">
```

**After:**
```html
<div class="story-screen gacha-screen-inner" id="gachaScreen" style="display: none;">
    <h2 id="gachaTitle" class="gacha-title">🎰 コマガチャ 🎰</h2>
    <p id="gachaDesc" class="gacha-desc">次のステージの持ち駒を獲得しよう！</p>
    <div id="gachaResult" class="gacha-result-display">
    </div>
    <div id="gachaResultName" class="gacha-result-name"></div>
    <div id="gachaResultRarity" class="gacha-result-rarity"></div>
    <div id="gachaRollArea" class="gacha-roll-area">
        <button class="mode-btn gacha-roll-btn" id="gachaRollBtn" onclick="rollGacha()">
            ガチャを引く！
        </button>
        <button class="mode-btn gacha-next-btn" id="gachaNextBtn" onclick="proceedAfterGacha()">
            次のステージへ →
        </button>
    </div>
    <div class="gacha-rates-box">
```

> [!NOTE]
> `gachaScreen` と `gachaNextBtn` の `display: none` はJSで動的に切り替えるため残します。ただし `gachaScreen` は `hideAllScreens()` で制御されるので、CSSで初期状態を `display: none` にする場合は `.story-screen` のルールが適用されます。既にHTMLに `style="display: none;"` があるので、それはそのまま残してください。

---

#### こまずかん画面（L270-280）

**Before:**
```html
<div class="story-screen" id="encyclopediaScreen" style="display: none; max-width: 800px; height: 90vh;">
    <h2 style="color: #2196F3; margin-bottom: 10px;">こまずかん</h2>
    <div style="display: flex; gap: 20px; width: 100%; height: 100%; overflow: hidden;">
        <div id="pieceList" style="flex: 1; overflow-y: auto; background: #fff; padding: 10px; border-radius: 10px; border: 1px solid #ddd;"></div>
        <div id="pieceDetail" style="flex: 2; background: #fff; padding: 15px; border-radius: 10px; border: 1px solid #ddd; text-align: left;"></div>
    </div>
    <button class="mode-btn" style="background-color: #777; margin-top: 15px;" onclick="showTitleScreen()">タイトルへ</button>
```

**After:**
```html
<div class="story-screen encyclopedia-screen-inner" id="encyclopediaScreen" style="display: none;">
    <h2 class="encyclopedia-title">こまずかん</h2>
    <div class="encyclopedia-layout">
        <div id="pieceList" class="encyclopedia-list"></div>
        <div id="pieceDetail" class="encyclopedia-detail"></div>
    </div>
    <button class="mode-btn guide-back-btn" style="margin-top: 15px;" onclick="showTitleScreen()">タイトルへ</button>
```

---

#### 解説コーナー画面（L282-338）

**Before:**
```html
<div class="story-screen" id="guideScreen" style="display: none; max-width: 800px; height: 90vh; overflow-y: auto;">
    <h2 style="color: #4CAF50; margin-bottom: 20px;">📖 解説コーナー 📖</h2>
    
    <div style="text-align: left; width: 100%; padding: 0 20px; box-sizing: border-box;">
        <h3 style="color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 5px;">ガチャシステムとは？</h3>
```

**After:**
```html
<div class="story-screen guide-screen-inner" id="guideScreen" style="display: none;">
    <h2 class="guide-title">📖 解説コーナー 📖</h2>
    
    <div class="guide-content">
        <h3 class="guide-section-gacha">ガチャシステムとは？</h3>
```

---

**Before:**
```html
        <ul style="font-size: 14px; color: #555; background: #f9f9f9; padding: 10px 30px; border-radius: 8px;">
```
**After:**
```html
        <ul class="guide-rates-list">
```

---

**Before:**
```html
        <h3 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 5px; margin-top: 30px;">助っ人システムとは？</h3>
```
**After:**
```html
        <h3 class="guide-section-helper">助っ人システムとは？</h3>
```

---

**Before:**
```html
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; background: #fff;">
            <tr style="background-color: #e3f2fd;">
                <th style="border: 1px solid #bbdefb; padding: 10px; width: 35%;">能力名 (アイコン)</th>
                <th style="border: 1px solid #bbdefb; padding: 10px;">効果の詳細</th>
            </tr>
            <tr>
                <td style="border: 1px solid #eee; padding: 10px;">...</td>
                <td style="border: 1px solid #eee; padding: 10px;">...</td>
            </tr>
            ...
```
**After:**
```html
        <table class="guide-helper-table">
            <tr>
                <th class="col-name">能力名 (アイコン)</th>
                <th>効果の詳細</th>
            </tr>
            <tr>
                <td>...</td>
                <td>...</td>
            </tr>
            ...
```
> テーブルの各 `<td>` と `<tr>` からすべてのインラインスタイルを削除。CSSクラスで一括管理。

---

**Before:**
```html
    <button class="mode-btn" style="background-color: #777; margin-top: 30px;" onclick="showTitleScreen()">タイトルへ</button>
```
**After:**
```html
    <button class="mode-btn guide-back-btn" onclick="showTitleScreen()">タイトルへ</button>
```

---

#### モーダル（L340-354）

**Before:**
```html
        <input id="customModalInput" type="password" placeholder=""
            style="display:none; margin-bottom:16px; padding:10px 14px; border-radius:8px; border:1.5px solid #ccc; font-size:16px; width:100%; box-sizing:border-box; outline:none;"
            onkeydown="if(event.key==='Enter') submitModal()">
        <div style="display:flex; gap:10px; justify-content:center;">
            ...
            <button id="customModalSubmit" onclick="submitModal()"
                style="display:none; background:linear-gradient(135deg,#2196F3,#1565c0); color:white; border:none; border-radius:10px; padding:12px 36px; font-size:16px; font-weight:700; cursor:pointer;">送信</button>
```
**After:**
```html
        <input id="customModalInput" type="password" placeholder=""
            class="modal-input"
            onkeydown="if(event.key==='Enter') submitModal()">
        <div class="modal-buttons-row">
            ...
            <button id="customModalSubmit" onclick="submitModal()"
                class="modal-submit-btn">送信</button>
```

---

#### 開発者用ロック解除（L84-87）

**Before:**
```html
<div style="text-align: center; margin-top: 15px;">
    <span style="font-size: 12px; color: #aaa; cursor: pointer; text-decoration: underline;"
        onclick="devUnlock()">開発者用ロック解除</span>
</div>
```
**After:**
```html
<div class="dev-unlock-area">
    <span class="dev-unlock-link"
        onclick="devUnlock()">開発者用ロック解除</span>
</div>
```

---

### 4-4. JS内のインラインスタイル参照の確認

> [!WARNING]
> いくつかのJSファイルがインラインスタイルを直接操作しています（`element.style.display = 'none'` 等）。これらは**変更しないでください**。JSによる動的なスタイル変更は機能上必要であり、CSSクラスへの移行対象ではありません。

特に以下のJSファイルでは `style.display`, `style.backgroundColor`, `style.opacity` 等が使われています：
- `ui.js`（render関連）
- `ui_story.js`（ボタンのスタイル変更）
- `ui_gacha.js`（ボタンの表示/非表示）
- `ui_common.js`（モーダル制御）

これらはすべて現状のまま維持してください。

---

## 検証計画

変更完了後、以下の手順で動作確認を行ってください。

### 1. ブラウザでの基本確認
- `実行.html` を開き、ゲームが正常にリダイレクトされるか
- タイトル画面が正常に表示されるか（カードのレイアウト、ホバーエフェクト）

### 2. 各モードの動作確認
- [ ] **チュートリアル**: 各ステップが正常に進行するか
- [ ] **対人戦**: 駒の移動・取り・成りが正常か
- [ ] **プラクティス（AI対戦）**: レベル選択画面→AI対戦が正常か
- [ ] **ストーリーモード**: ステージ1のイントロ→対戦が正常か
- [ ] **こまずかん**: 駒リスト→詳細表示が正常か
- [ ] **解説コーナー**: テーブルの表示が正常か

### 3. CSS修復の確認
- [ ] ボード上のメッセージオーバーレイ（`#boardMessageOverlay`）が表示されるか
- [ ] 助っ人ボタンのツールチップが表示されるか
- [ ] モーダルのOKボタンにホバーエフェクトがあるか
- [ ] ガチャボタンのパルスアニメーションが動作するか

### 4. ai.js バグ修正の確認
- [ ] 開発者パスワード `shogi` で全モード解放
- [ ] 真ストーリーモード Stage 5（ラストライオン）で「次元の裁き」が3ターンごとに発動するか

### 5. コンソールエラー確認
- [ ] ブラウザの開発者ツール（F12）→コンソールにJavaScriptエラーがないこと
