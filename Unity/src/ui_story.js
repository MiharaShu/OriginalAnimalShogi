function showStoryScreen() {
    hideAllScreens();
    const screen = document.getElementById('storyScreen');
    screen.style.display = 'flex';

    const titleEl = document.getElementById('storyStageTitle');
    const nameEl = document.getElementById('storyEnemyName');
    const imgEl = document.getElementById('storyEnemyImg');
    const msgEl = document.getElementById('storyMessage');
    const condEl = document.getElementById('storyCondition');
    const btnEl = document.getElementById('storyActionBtn');

    // Make absolutely sure helper area is hidden by default upon entering this screen
    document.getElementById('helperSelectionArea').style.display = 'none';

    // Reset visibility
    condEl.style.display = "none";

    if (storyState === 'clear') {
        renderClearScreen(titleEl, nameEl, imgEl, msgEl, btnEl);
        return;
    }

    if (storyState === 'true_clear') {
        renderTrueStoryClear(titleEl, nameEl, imgEl, msgEl, condEl, btnEl);
        return;
    }

    const enemy = (gameMode === 'TrueStory') ? TRUE_STORY_ENEMIES[currentStage] : STORY_ENEMIES[currentStage];
    
    // 安全装置: enemyが存在しない場合のエラー回避
    if (!enemy) {
        console.error("Story context error: currentStage=", currentStage, "mode=", gameMode);
        showTitleScreen();
        return;
    }

    nameEl.textContent = enemy.name.replace('！', '');
    imgEl.src = enemy.image;
    btnEl.style.display = "inline-block";

    if (storyState === 'intro') {
        renderIntroStep(enemy, titleEl, nameEl, imgEl, msgEl, condEl, btnEl);
        // Show selection in Story/Endless after intro dialogue ONLY on stage 1
        const area = document.getElementById('helperSelectionArea');
        const isFirstStage = (currentStage === 0);
        const isStoryMode = (gameMode === 'Story');
        const isTrueStoryReady = (gameMode === 'TrueStory' && currentIntroStep >= 4);
        const isEndlessReady = (gameMode === 'Endless' && endlessFloor === 1);

        if (isFirstStage && (isStoryMode || isTrueStoryReady || isEndlessReady)) {
            area.style.display = 'flex';
            updateHelperPool();
        } else {
            area.style.display = 'none';
        }
    } else if (storyState === 'win') {
        handleStageWin(enemy, titleEl, msgEl, btnEl);
    } else if (storyState === 'lose') {
        handleStageLose(enemy, titleEl, msgEl, btnEl);
    }
    
    triggerStoryAnimations();
}

function renderIntroStep(enemy, titleEl, nameEl, imgEl, msgEl, condEl, btnEl) {
    if (gameMode === 'TrueStory') {
        renderTrueStoryIntro(enemy, titleEl, nameEl, imgEl, msgEl, condEl, btnEl);
    } else {
        // Generic Story Mode Intro
        titleEl.textContent = `ステージ ${currentStage + 1}`;
        titleEl.style.color = "#9C27B0";
        msgEl.textContent = enemy.msgStart;
        if (enemy.conditionDesc) {
            condEl.textContent = enemy.conditionDesc;
            condEl.style.display = "block";
        }
        btnEl.textContent = "勝負開始！";
        btnEl.style.backgroundColor = "#4CAF50";
        btnEl.onclick = startStoryBattle;
    }
}

function renderTrueStoryIntro(enemy, titleEl, nameEl, imgEl, msgEl, condEl, btnEl) {
    // Stage specific branching logic (long text)
    // Refactored to use currentStage and currentIntroStep
    const stage = currentStage;
    const step = currentIntroStep;

    if (stage === 0) {
        if (step === 0) {
            titleEl.textContent = "第1戦：伝説の帰還";
            titleEl.style.color = "#d32f2f";
            msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】現実世界の自宅。異変。目の前の空間が歪み、光の渦が現れる。どこからか、聞き覚えのある鳴き声が聞こえてくる——</small><b>らいおんきんぐ</b><br>「人間よ、聞こえルか……！<br>大変だ、この声に応じろ！！」`;
            setNextStepBtn(btnEl);
        } else if (step === 1) {
            titleEl.textContent = "第1戦：再会";
            msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】気づけば、主人公はどぶつ将棋の世界に立っていた。</small><b>あなた</b>「こ、この声は……らいおんきんぐ？！<br>ここはどこだ……俺、ついさっきまで部屋に——」<br><br><b>らいおんきんぐ</b><br>「久しいな、人間よ。喜びは後だ。<br>まずは話を聞け、時間がない。」`;
            setNextStepBtn(btnEl);
        } else if (step === 2) {
            titleEl.textContent = "第1戦：世界の危機";
            msgEl.innerHTML = `<b>らいおんきんぐ</b><br>「数週間前、『ダークフェニックス男』と名乗る男が現れた。お前と同じ、現実世界の人間だ。<br><br>「やつは闇の秘術でこの世界を支配……次元間の『次元崩壊装置』を完成させた。このままでは、この世界そのものが壊滅する……」<br><br><b>あなた</b>「次元崩壊装置……！それで俺を呼んだのか。」`;
            setNextStepBtn(btnEl);
        } else if (step === 3) {
            titleEl.textContent = "第1戦：導かぬ道";
            msgEl.innerHTML = `<b>らいおんきんぐ</b><br>「私が送り込んだ精鋭はすべて返り討ちに遭った。やつの将棋の腕は……おそらく私を、も超えている。<br><br>「ならば頼めるのはひとりしかいない——かつてこの私を打ち負かした、お前しかいないのだ。」<br><br><b>あなた</b>「……わかった。やってみせる。」`;
            setNextStepBtn(btnEl);
        } else if (step === 4) {
            titleEl.textContent = "第1戦：王の試練";
            msgEl.innerHTML = `<b>らいおんきんぐ</b><br>「だが、ただ頼むだけでは王の沽券に関わる。現実に戻ってから年月も経つだろう。その腕が、まだ通用するかどうか——この王自らが確かめさせてもらう！」<br><br><b>あなた</b>「……望むところだ。来い、らいおんきんぐ！」<br><br><b>らいおんきんぐ</b>「ガオオオォ！！さすがの決断だ……では、参る！！」`;
            condEl.textContent = "【真ストーリーモード】敗北した場合ステージ1からやり直しです。強力な3つの『助っ人』は真ストーリー全体を通して各1回ずつしか使えません。効果については自ら確かめてください";
            condEl.style.display = "block";
            setStartBattleBtn(btnEl);
        }
    } else if (stage === 1) {
        // Stage 2: Dark Phoenix
        if (step === 0) {
            titleEl.textContent = "第2戦：昏き研究所";
            titleEl.style.color = "#9c27b0";
            imgEl.src = "../assets/images/hiyo.webp";
            nameEl.textContent = "ヒヨコ";
            msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】暗い遺跡。あちこちで次元の歪みが発生し、世界が崩れている——</small><b>ヒヨコ</b><br>「主人公さん、ここです！次元装置はこの奧に……。でも、もう敵が待ち構えています。気をつけて！」<br><br><b>あなた</b>「……行くしかない。」`;
            setNextStepBtn(btnEl);
        } else if (step === 1) {
            titleEl.textContent = "第2戦：乱入者の正体";
            msgEl.innerHTML = `<b>ダークフェニックス男</b><br>「よく来た……。さすがはらいおんきんぐが頼った『人間』だ。」<br><b>あなた</b><br>「俺の名前？そんなことはどうでもいい。早くこの装置を止めるんだ！」<br><b>ダークフェニックス男</b><br>「ある日、この世界に迷い込んだ。らいおんきんぐとの対決——血を吐くまでの熱戦——そして、絶望。」`;
            setNextStepBtn(btnEl);
        } else if (step === 2) {
            titleEl.textContent = "第2戦：消えた記憶";
            msgEl.innerHTML = `<b>ダークフェニックス男</b><br>「気づいたら……現実が消えていた。友人の顔も、家族の声も、自分の名前さえも。全部、綺麗に消えていた。」<br><br><b>あなた</b>「…この世界から戻れないと、現実から切り離されてしまうということか？」<br><br><b>ダークフェニックス男</b>「同情するなよ！！そんな目で俺を見るな……！俺は諦めない！この世界を壊し、次元の扉を無理矢理こじ開けてでも！俺は帰る！！たとえ、すべてを道連れにしようとも！！」`;
            setNextStepBtn(btnEl);
        } else {
            titleEl.textContent = "第2戦：駒を手に取れ";
            msgEl.innerHTML = `<b>あなた</b><br>「……お前が辛い思いをしたのはわかる。でも、このままじゃ、この世界どころか現実世界にまで影響が及んでしまう。」<br><br>「お前の痛みは、受け止められない。だけど、俺は——お前に勝つ！」<br><br><b>ダークフェニックス男</b><br>「……来いよ、お前を倒して、俺は帰る！！！」`;
            if (enemy.conditionDesc) {
                condEl.textContent = enemy.conditionDesc;
                condEl.style.display = "block";
            }
            setStartBattleBtn(btnEl);
        }
    } else if (stage === 2) {
        // Stage 3: Phoenix
        if (step === 0) {
            titleEl.textContent = "第3戦：炎の中から";
            titleEl.style.color = "#FF9800";
            msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】倒れたはずのダークフェニックス男が、優しい光に包まれる。纏っていた暗い闇が浄化され、穏やかな黄金の輝きへと変わっていく——</small><b>あなた</b>「な、何が……！」<br><br><b>真フェニックス男</b><br>「あ、ああ……何て清い光だ。頭がクリアになっていく……。」`;
            setNextStepBtn(btnEl);
        } else if (step === 1) {
            titleEl.textContent = "第3戦：取り戻した名前";
            msgEl.innerHTML = `<b>真フェニックス男</b><br>「俺は……『山田悠斗』。プロ棋士だった人間だ。らいおんきんぐに負けてこの世界に囚われていた。<br><br>「お前が、俺の悪夢を打ち砕いてくれた……ありがとう。本当に、ありがとう。」`;
            setNextStepBtn(btnEl);
        } else if (step === 2) {
            titleEl.textContent = "第3戦：残酷なシステム";
            msgEl.innerHTML = `<b>あなた</b><br>「よかった……じゃあ一緒に元の世界へ——」<br><br><b>真フェニックス男</b><br>「……待て。この次元のシステムを解読した俺だから、知っている。<br><br>「——現実世界へ帰還できるのは、一度に一人だけ。」<br><br>「次元の扉が開くのはほんの一瞬。俺たちが抜けられる時間は、もうない。」`;
            setNextStepBtn(btnEl);
        } else if (step === 3) {
            titleEl.textContent = "第3戦：譲れない想い";
            msgEl.innerHTML = `<b>あなた</b>「……そうか。」<br><br><b>真フェニックス男</b>「俺はもう闇に堕ちない。ただ——俺には待っている生徒たちがいる。将棋の楽しさを伝えるという、願いがある。それだけは……諦めない。」<br><br><b>あなた</b>「俺にも……帰る場所がある。」<br><br><b>真フェニックス男</b>「ならば全力でこい。この盤上に俺のすべてをぶつける——勝った方が帰る、それで文句はないな！」`;
            setNextStepBtn(btnEl);
        } else {
            titleEl.textContent = "第3戦：ヒヨコの忠告";
            imgEl.src = "../assets/images/hiyo.webp";
            msgEl.innerHTML = `<b>ヒヨコ</b><br>「気をつけて！彼は倒されても１度だけ❤のマスへと復活します！」`;
            if (enemy.conditionDesc) {
                condEl.textContent = enemy.conditionDesc;
                condEl.style.display = "block";
            }
            setStartBattleBtn(btnEl);
        }
    } else if (stage === 3) {
        // Stage 4: Legendary Knight
        if (step === 0) {
            titleEl.textContent = "第4戦：結社の中枢";
            imgEl.src = "../assets/images/ブラックホール1.webp";
            msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】ついに闇の秘密結社の中枢へと辿り着いた。しかしそこに結社の者の姿はなく、一人の騎士が佇んでいた。</small><b>あなた</b><br>「お前は……闇の結社の人間か！？」`;
            setNextStepBtn(btnEl);
        } else if (step === 1) {
            titleEl.textContent = "第4戦：最強の騎士";
            titleEl.style.color = "#37474f";
            msgEl.innerHTML = `<b>デンセツノキシ</b><br>「……結社？ そのようなもの、私の知ったことではない。<br><br>「私は純粋なる強者との戦いのみを求める、現世最強の騎士『デンセツノキシ』。……ここへ向かう道中、貴殿の圧倒的な力を見た。」`;
            setNextStepBtn(btnEl);
        } else if (step === 2) {
            titleEl.textContent = "第4戦：立ち塞がる者";
            msgEl.innerHTML = `<b>デンセツノキシ</b><br>「私の剣が、貴殿と交えることを渇望しているのだ。」<br><br><b>あなた</b><br>「俺は結社の野望を止めなきゃいけないんだ！戦っている暇は……！」<br><br><b>真フェニックス男</b><br>「ダメだ、こいつは本気だ。お前が勝たない限り、絶対に道は開かないぞ！」`;
            setNextStepBtn(btnEl);
        } else if (step === 3) {
            titleEl.textContent = "第4戦：孤独の果て";
            msgEl.innerHTML = `<b>デンセツノキシ</b><br>「私はずっと待っていました。誰かが——私を超える者が現れることを。<br><br>「さあ、お前のその力……私の剣で存分に味わわせてもらおう！」<br><br><b>あなた</b><br>「……行くしかないか。手加減はしないぞ！」`;
            setNextStepBtn(btnEl);
        } else if (step === 4) {
            titleEl.textContent = "第4戦：未知の駒";
            titleEl.style.color = "#FF9800";
            imgEl.src = "../assets/images/hiyo.webp";
            msgEl.innerHTML = `<b>ヒヨコ</b><br>「彼は未知の駒を持っています！最強コマの『竜王』、麒麟に並ぶ『ナイト』、消えゆく『幽霊にわとり』……気をつけてください！」<br><br><small style="color:#888;display:block;margin-top:8px;">【状況説明】現世最強の騎士との、純粋なる力と力のぶつかり合いが始まった——</small>`;
            if (enemy.conditionDesc) {
                condEl.textContent = enemy.conditionDesc;
                condEl.style.display = "block";
            }
            setStartBattleBtn(btnEl);
        }
    } else if (stage === 4) {
        // Stage 5: ラストライオン（次元の裂け目から神話の神が出現）
        if (step === 0) {
            titleEl.textContent = "最終決戦：暴走の果て";
            titleEl.style.color = "#6a1b9a";
            imgEl.src = "../assets/images/ブラックホール1.webp";
            nameEl.textContent = "秘密結社";
            msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】デンセツノキシとの死闘を制した直後。ついに『闇の秘密結社』の黒幕たちが姿を現す。</small><b>結社首領</b><br>「フハハハ！よくぞ我らが作り出した最強の騎士を倒した！だが我々の『次元崩壊装置』の力はすでに臨界点に達している！この世界は終わりだ！」<br><br><b>あなた</b><br>「しまった……！遅かったか！」`;
            setNextStepBtn(btnEl);
        } else if (step === 1) {
            titleEl.textContent = "最終決戦：神獣降臨";
            titleEl.style.color = "#6a1b9a";
            imgEl.src = enemy.image;
            nameEl.textContent = "ラストライオン";
            msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】突如、装置が限界を超えて暴走を始める。圧倒的な光とともに次元の彼方から巨大な獣が降臨した。</small><b>結社首領</b><br>「な、なんだこれは！？ 装置の力が暴走して……ぎゃあああああ！！」<br><br><small style="color:#888;display:block;margin-top:8px;">【状況説明】光に飲み込まれ、闇の秘密結社は一瞬にして跡形もなく消し飛んだ。</small>`;
            setNextStepBtn(btnEl);
        } else if (step === 2) {
            titleEl.textContent = "最終決戦：次元の裁き";
            imgEl.src = "../assets/images/lastlion.webp";
            nameEl.textContent = "ラストライオン";
            msgEl.innerHTML = `<b>ラストライオン</b><br>「……愚か者どもの力が、次元の彼方より我を呼び覚ましたか。我は全てを無に還す神獣『ラストライオン』。」<br><br><b>あなた</b><br>「なんだこのプレッシャーは……。結社が一瞬で消え去った……！」`;
            setNextStepBtn(btnEl);
        } else if (step === 3) {
            titleEl.textContent = "最終決戦：神話の力";
            imgEl.src = enemy.image;
            nameEl.textContent = "ラストライオン";
            msgEl.innerHTML = `<b>ラストライオン</b><br>「このまま力の暴走が続けば、この次元そのものが崩壊する。……摂理を超えし人間よ、我が力、止めてみせよ。」<br><br><b>らいおんきんぐ</b><br>「ガオオ！こいつは神話の時代の神獣だ！このままではすべてが無に還る……お前しかいない、頼む！」`;
            setNextStepBtn(btnEl);
        } else {
            titleEl.textContent = "最終決戦：決戦の時";
            titleEl.style.color = "#6a1b9a";
            imgEl.src = "../assets/images/lastlion.webp";
            nameEl.textContent = "ラストライオン";
            msgEl.innerHTML = `<b>ラストライオン</b><br>「我の力は盤面の列と行を貫く。3ターンに一度、次元の力が解放される……。全力でかかってこい。」<br><br><b>あなた</b><br>「……これが本当の最終決戦だ。いくぞ！」`;
            if (enemy.conditionDesc) {
                condEl.textContent = enemy.conditionDesc;
                condEl.style.display = "block";
            }
            setStartBattleBtn(btnEl);
        }
    }
}

function setNextStepBtn(btnEl) {
    btnEl.textContent = "次へ";
    btnEl.style.backgroundColor = "#2196F3";
    btnEl.onclick = incrementIntroStep;
}

function setStartBattleBtn(btnEl) {
    btnEl.textContent = "勝負開始！";
    btnEl.style.backgroundColor = "#4CAF50";
    btnEl.onclick = startStoryBattle;
}

function handleStageWin(enemy, titleEl, msgEl, btnEl) {
    titleEl.textContent = `ステージ ${currentStage + 1} クリア！`;
    titleEl.style.color = "#FF9800";
    msgEl.textContent = enemy.msgLose;

    const len = (gameMode === 'TrueStory') ? TRUE_STORY_ENEMIES.length : STORY_ENEMIES.length;

    if (currentStage + 1 >= len) {
        btnEl.textContent = "次へ";
        btnEl.onclick = () => {
            if (gameMode === 'TrueStory') {
                storyState = 'true_clear';
                currentIntroStep = 0;
            } else {
                storyState = 'clear';
                document.getElementById('trueStoryCard').classList.remove('locked');
            }
            showStoryScreen();
        };
    } else {
        const maxGacha = (gameMode === 'TrueStory') ? 5 : 2;
        if (gachaStock < maxGacha) {
            gachaStock++;
            btnEl.textContent = `ガチャを獲得！(残:${gachaStock})`;
            btnEl.style.backgroundColor = "#e040fb";
        } else {
            btnEl.textContent = "次のステージへ (ストック満タン)";
            btnEl.style.backgroundColor = "#777";
        }
        btnEl.onclick = () => {
            storyState = 'intro';
            currentStage++;
            currentIntroStep = 0;
            showStoryScreen();
        };
    }
}

function handleStageLose(enemy, titleEl, msgEl, btnEl) {
    const maxGacha = (gameMode === 'TrueStory') ? 5 : 2;
    let bonusMsg = "";
    if (gachaStock < maxGacha) {
        gachaStock++;
        bonusMsg = `<br><br><span style="color:#e040fb; font-weight:bold;">✨負けてしまったお詫びにガチャストックを獲得しました！（現在 ${gachaStock} / ${maxGacha}）</span>`;
    }

    titleEl.style.color = "#d32f2f";
    if (gameMode === 'TrueStory') {
        titleEl.textContent = `敗北...（ステージ 1に戻ります）`;
        msgEl.innerHTML = (enemy.msgWin ? enemy.msgWin : "最初からやり直しですが...") + bonusMsg;
        btnEl.textContent = "最初から挑戦する";
        btnEl.style.backgroundColor = "#d32f2f";
        btnEl.onclick = () => {
            startTrueStoryMode(true);
        };
    } else {
        titleEl.textContent = `ステージ ${currentStage + 1} 敗北...`;
        msgEl.innerHTML = (enemy.msgWin || "負けました...") + bonusMsg;
        btnEl.textContent = "再挑戦する";
        btnEl.style.backgroundColor = "#ff9800";
        btnEl.onclick = startStoryBattle;
    }
}

function renderClearScreen(titleEl, nameEl, imgEl, msgEl, btnEl) {
    titleEl.textContent = "おめでとう！";
    titleEl.style.color = "#FFD700";
    nameEl.textContent = "ストーリーモード 全クリア！";
    imgEl.src = "../assets/images/story_clear_king.webp";
    msgEl.textContent = "あなたはすべての敵を倒し、どうぶつ将棋の頂点に立ちました！";
    btnEl.style.display = "none";
}

function renderTrueStoryClear(titleEl, nameEl, imgEl, msgEl, condEl, btnEl) {
    const step = currentIntroStep;
    btnEl.style.display = "inline-block";
    condEl.style.display = "none";

    if (step === 0) {
        titleEl.textContent = "エピローグ：次元の終焉";
        titleEl.style.color = "#FFD700";
        imgEl.src = "../assets/images/lastlion.webp";
        nameEl.textContent = "ラストライオン";
        msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】ラストライオンの巨体が光に包まれ、次元の裂け目が閉じ始める——</small><b>ラストライオン</b><br>「……まさか。神話の時代以来、我を超える者が現れるとは。<br><br>「次元の裂け目は閉じる。この世界の摂理は、お前が守った。……見事だ、次元の勇者よ。」`;
        setNextStepBtn(btnEl);
    } else if (step === 1) {
        titleEl.textContent = "エピローグ：光の射す方へ";
        titleEl.style.color = "#FFD700";
        imgEl.src = "../assets/images/story_clear_king.webp";
        nameEl.textContent = "デンセツノキシ";
        msgEl.innerHTML = `<b>デンセツノキシ</b><br>「……見事です。神話の存在すら超えましたか。<br><br>「これで、すべての呪縛は解けました。元の場所へ、帰るがよい……。」`;
        setNextStepBtn(btnEl);
    } else if (step === 2) {
        titleEl.textContent = "エピローグ：再会と約束";
        imgEl.src = "../assets/images/真フェニックス男.webp";
        nameEl.textContent = "山田悠斗";
        msgEl.innerHTML = `<b>山田悠斗</b><br>「やったな……。神話の神獣まで倒すとは。次元の装置も完全にシャットダウンされた。扉が開いている……今なら、二人で帰れる！」<br><br>「現実に戻ったら、また対局しよう。今度はこの世界の加護抜きで、本当の真剣勝負だ。」`;
        setNextStepBtn(btnEl);
    } else if (step === 3) {
        titleEl.textContent = "エピローグ：現実への扉";
        imgEl.src = "../assets/images/らいおんきんぐ.webp";
        nameEl.textContent = "らいおんきんぐ";
        msgEl.innerHTML = `<b>らいおんきんぐ</b><br>「ガオオオ！二人とも、よくぞやってくれた！神話の神獣まで倒すとは……お前は伝説を超えた存在だ！<br><br>「お前たちの絆が、世界を救ったのだ。さあ、躊躇せず進め！眩い未来がお前たちを待っているぞ！！」`;
        setNextStepBtn(btnEl);
    } else if (step === 4) {
        titleEl.textContent = "真・エンディング";
        imgEl.src = "../assets/images/lion.webp";
        nameEl.textContent = "結末";
        msgEl.innerHTML = `<small style="color:#888;display:block;margin-bottom:8px;">【状況説明】眩い光に包まれ、気づくとあなたは自分の部屋に座っていた。パソコンの画面には「どうぶつ将棋」の勝利画面。すべては夢だったのか？——しかし、あなたの手元には、見たこともない黄金の駒（ライオン）が握られていた。</small><b>あなた</b><br>「……さて、次の相手は誰かな。」<br><br><p style="text-align:center; font-weight:bold; color:#FFD700; font-size:24px; margin-top:20px;">TRUE ENDING</p>`;
        btnEl.textContent = "タイトルに戻る";
        btnEl.style.backgroundColor = "#777";
        btnEl.onclick = showTitleScreen;
    }
}

function incrementIntroStep() {
    currentIntroStep++;
    showStoryScreen();
}
function updateHelperPool() {
    const pool = document.getElementById('helperPool');
    pool.innerHTML = '';

    // Available pieces to choose as helpers
    const possible = [
        { id: 'superChick', name: '🐣x3', desc: 'ヒヨコ3羽' },
        { id: 'eradicate', name: '💥', desc: '滅却' },
        { id: 'phoenix', name: '🔥', desc: 'フェニックス' },
        { id: 'awaken', name: '👑', desc: '覚醒' },
        { id: 'timeStop', name: '⏳', desc: '砂時計' },
        { id: 'reunion', name: '👪', desc: 'リユニオン' }
    ];

    possible.forEach(h => {
        const btn = document.createElement('button');
        const isActive = equippedHelpers.includes(h.id);
        btn.className = 'helper-btn' + (isActive ? ' active-selection' : '');
        btn.style.width = "80px";
        btn.style.opacity = isActive ? "1" : "0.5";
        btn.style.border = isActive ? "2px solid #4CAF50" : "1px solid #ccc";

        btn.innerHTML = `<span style="font-size:18px">${h.name}</span><br><span style="font-size:10px">${h.desc}</span>`;
        btn.onclick = () => toggleHelperSelection(h.id);
        pool.appendChild(btn);
    });

    const maxHelpers = (gameMode === 'TrueStory') ? 3 : 1;
    document.getElementById('helperSelectionTitle').textContent = `助っ人を選択（最大${maxHelpers}つ）`;
    document.getElementById('helperSelectionStatus').innerHTML = `選択中: <span id="selectedHelperCount">${equippedHelpers.length}</span> / ${maxHelpers}`;
}

function toggleHelperSelection(id) {
    const idx = equippedHelpers.indexOf(id);
    if (idx > -1) {
        equippedHelpers.splice(idx, 1);
    } else {
        const maxHelpers = (gameMode === 'TrueStory') ? 3 : 1;
        if (equippedHelpers.length >= maxHelpers) {
            showQuickNotice(`⚠️ 助っ人は最大${maxHelpers}つまでです！`);
            return;
        }
        equippedHelpers.push(id);
    }
    updateHelperPool();
}

// --- Story Animations ---
let typewriterInterval = null;
let typewriterCompleteHtml = "";
let isTypewriting = false;

function playTypewriter(el, html) {
    if (typewriterInterval) clearInterval(typewriterInterval);
    typewriterCompleteHtml = html;
    isTypewriting = true;
    el.innerHTML = "";
    
    const tokens = html.split(/(<[^>]+>)/g).filter(t => t !== '');
    
    let currentHtml = "";
    let tokenIndex = 0;
    let charIndex = 0;
    
    typewriterInterval = setInterval(() => {
        if (tokenIndex >= tokens.length) {
            clearInterval(typewriterInterval);
            isTypewriting = false;
            return;
        }
        
        let token = tokens[tokenIndex];
        if (token.startsWith("<")) {
            currentHtml += token;
            tokenIndex++;
        } else {
            // Handle HTML entities roughly by just outputting them, browser will fix
            if (charIndex < token.length) {
                currentHtml += token.charAt(charIndex);
                charIndex++;
            } else {
                charIndex = 0;
                tokenIndex++;
            }
        }
        el.innerHTML = currentHtml;
    }, 20);
}

function skipTypewriter(e) {
    // ボタンのクリック時はスキップだけにしてボタン処理を阻害しないようにする
    if (isTypewriting) {
        clearInterval(typewriterInterval);
        isTypewriting = false;
        document.getElementById('storyMessage').innerHTML = typewriterCompleteHtml;
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

function triggerStoryAnimations() {
    const imgEl = document.getElementById('storyEnemyImg');
    if (imgEl.src) {
        imgEl.classList.remove('slide-in-left');
        void imgEl.offsetWidth; // Reflow
        imgEl.classList.add('slide-in-left');
    }
    
    const msgEl = document.getElementById('storyMessage');
    const fullHtml = msgEl.innerHTML;
    if (fullHtml) {
        playTypewriter(msgEl, fullHtml);
    }
}

// Bind click event to story screen to allow skipping
const storyScreenEl = document.getElementById('storyScreen');
if (storyScreenEl) {
    storyScreenEl.addEventListener('click', skipTypewriter);
}
