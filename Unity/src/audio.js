// --- Audio Synthesis Engine ---
// Web Audio APIを用いた効果音の動的生成

const AudioEngine = {
    ctx: null,
    enabled: true,

    init: function() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone: function(frequency, type, duration, vol=0.1) {
        if (!this.enabled) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playMove: function() {
        // カチッという短い音
        this.playTone(400, 'sine', 0.1, 0.15);
    },

    playCapture: function() {
        // コマを取った時の少し高い音
        this.playTone(800, 'square', 0.15, 0.1);
        setTimeout(() => this.playTone(1200, 'sine', 0.1, 0.1), 50);
    },

    playPromote: function() {
        // 成った時のキラキラ音
        this.playTone(523.25, 'sine', 0.1, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.1), 200); // G5
    },

    playWin: function() {
        // 勝利時のファンファーレ
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.2), i * 150);
        });
    },

    playLose: function() {
        // 敗北時の落ち込む音
        const notes = [440, 415.30, 392.00, 349.23];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sawtooth', 0.4, 0.1), i * 200);
        });
    },

    playError: function() {
        // エラー音（ブッ）
        this.playTone(150, 'sawtooth', 0.15, 0.1);
    }
};

// ユーザーが画面をクリックしたタイミングでAudioContextを初期化する
document.addEventListener('click', () => {
    AudioEngine.init();
}, { once: true });

// --- BGM Sequencer ---
function getFreq(note) {
    const notes = { 'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2 };
    const octave = parseInt(note.slice(-1));
    const key = note.slice(0, -1);
    return 440 * Math.pow(2, (octave - 4) + (notes[key] / 12));
}

// 汎用シーケンサークラス
class BaseSequencer {
    constructor(stepTime, melody, bass) {
        this.isPlaying = false;
        this.timerId = null;
        this.stepTime = stepTime;
        this.lookahead = 0.1;
        this.nextNoteTime = 0;
        this.currentStep = 0;
        this.totalSteps = 64;
        this.melodyNotes = melody;
        this.bassNotes = bass;
    }

    playToneAtTime(freq, type, time, duration, vol) {
        if (!AudioEngine.ctx) return;
        const osc = AudioEngine.ctx.createOscillator();
        const gain = AudioEngine.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.connect(gain);
        gain.connect(AudioEngine.ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
    }

    playNoiseAtTime(time, duration, vol) {
        if (!AudioEngine.ctx) return;
        const bufferSize = AudioEngine.ctx.sampleRate * duration;
        const buffer = AudioEngine.ctx.createBuffer(1, bufferSize, AudioEngine.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = AudioEngine.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = AudioEngine.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const gain = AudioEngine.ctx.createGain();
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(AudioEngine.ctx.destination);
        noise.start(time);
    }

    scheduler() {
        if(!this.isPlaying) return;
        while(this.nextNoteTime < AudioEngine.ctx.currentTime + this.lookahead) {
            this.scheduleNotesForStep(this.currentStep, this.nextNoteTime);
            this.nextNoteTime += this.stepTime;
            this.currentStep++;
            if(this.currentStep >= this.totalSteps) this.currentStep = 0;
        }
        this.timerId = setTimeout(() => this.scheduler(), 25);
    }

    scheduleNotesForStep(step, time) {
        const m = this.melodyNotes.find(n => n.s === step);
        if(m) this.playToneAtTime(getFreq(m.n), 'square', time, this.stepTime * 1.5, 0.05);
        
        const b = this.bassNotes.find(n => n.s === step);
        if(b) this.playToneAtTime(getFreq(b.n), 'sawtooth', time, this.stepTime * 3, 0.08);
        
        if (step % 2 === 0) this.playNoiseAtTime(time, 0.05, 0.05);
    }

    start() {
        if(this.isPlaying) return;
        AudioEngine.init();
        if (AudioEngine.ctx.state === 'suspended') {
            AudioEngine.ctx.resume().then(() => this._beginSequence());
        } else {
            this._beginSequence();
        }
    }

    _beginSequence() {
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = AudioEngine.ctx.currentTime + 0.1;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if(this.timerId) clearTimeout(this.timerId);
    }
}

// 1. 一般戦闘BGM
const BGMSequencer = new BaseSequencer(0.12, 
    [ // Melody
        {s:0, n:'A4'}, {s:2, n:'C5'}, {s:4, n:'E5'}, {s:6, n:'A5'}, {s:8, n:'E5'}, {s:10, n:'C5'}, {s:12, n:'A4'}, {s:14, n:'E5'},
        {s:16, n:'G4'}, {s:18, n:'B4'}, {s:20, n:'D5'}, {s:22, n:'G5'}, {s:24, n:'D5'}, {s:26, n:'B4'}, {s:28, n:'G4'}, {s:30, n:'D5'},
        {s:32, n:'F4'}, {s:34, n:'A4'}, {s:36, n:'C5'}, {s:38, n:'F5'}, {s:40, n:'C5'}, {s:42, n:'A4'}, {s:44, n:'F4'}, {s:46, n:'C5'},
        {s:48, n:'E4'}, {s:50, n:'G#4'}, {s:52, n:'B4'}, {s:54, n:'E5'}, {s:56, n:'B4'}, {s:58, n:'G#4'}, {s:60, n:'E4'}, {s:62, n:'B4'}
    ],
    [ // Bass
        {s:0, n:'A3'}, {s:4, n:'A3'}, {s:8, n:'A3'}, {s:12, n:'A3'},
        {s:16, n:'G3'}, {s:20, n:'G3'}, {s:24, n:'G3'}, {s:28, n:'G3'},
        {s:32, n:'F3'}, {s:36, n:'F3'}, {s:40, n:'F3'}, {s:44, n:'F3'},
        {s:48, n:'E3'}, {s:52, n:'E3'}, {s:56, n:'E3'}, {s:60, n:'E3'}
    ]
);

// 2. 真ストーリー・ステージ5用BGM（威圧感のある高速・重厚な曲調）
const TrueLastBossSequencer = new BaseSequencer(0.09, // 高速
    [ // Melody (Dm -> Bb -> C -> A) 
        {s:0, n:'D5'}, {s:2, n:'F5'}, {s:4, n:'A5'}, {s:6, n:'D6'}, {s:8, n:'A5'}, {s:10, n:'F5'}, {s:12, n:'D5'}, {s:14, n:'F5'},
        {s:16, n:'A#4'}, {s:18, n:'D5'}, {s:20, n:'F5'}, {s:22, n:'A#5'}, {s:24, n:'F5'}, {s:26, n:'D5'}, {s:28, n:'A#4'}, {s:30, n:'D5'},
        {s:32, n:'C5'}, {s:34, n:'E5'}, {s:36, n:'G5'}, {s:38, n:'C6'}, {s:40, n:'G5'}, {s:42, n:'E5'}, {s:44, n:'C5'}, {s:46, n:'E5'},
        {s:48, n:'A4'}, {s:50, n:'C#5'}, {s:52, n:'E5'}, {s:54, n:'A5'}, {s:56, n:'E5'}, {s:58, n:'C#5'}, {s:60, n:'A4'}, {s:62, n:'C#5'}
    ],
    [ // Bass (連打で重厚に)
        {s:0, n:'D3'}, {s:2, n:'D3'}, {s:4, n:'D3'}, {s:6, n:'D3'}, {s:8, n:'D3'}, {s:10, n:'D3'}, {s:12, n:'D3'}, {s:14, n:'D3'},
        {s:16, n:'A#2'}, {s:18, n:'A#2'}, {s:20, n:'A#2'}, {s:22, n:'A#2'}, {s:24, n:'A#2'}, {s:26, n:'A#2'}, {s:28, n:'A#2'}, {s:30, n:'A#2'},
        {s:32, n:'C3'}, {s:34, n:'C3'}, {s:36, n:'C3'}, {s:38, n:'C3'}, {s:40, n:'C3'}, {s:42, n:'C3'}, {s:44, n:'C3'}, {s:46, n:'C3'},
        {s:48, n:'A2'}, {s:50, n:'A2'}, {s:52, n:'A2'}, {s:54, n:'A2'}, {s:56, n:'A2'}, {s:58, n:'A2'}, {s:60, n:'A2'}, {s:62, n:'A2'}
    ]
);

// デンセツノキシ（ステージ4）用の外部BGM
const stage4BossAudio = new Audio('../assets/audio/ラスボス.mp3');
stage4BossAudio.loop = true;
stage4BossAudio.volume = 0.5;

AudioEngine.playBGM = function() {
    if (!AudioEngine.enabled) return;
    
    if (typeof gameMode !== 'undefined' && gameMode === 'TrueStory') {
        if (typeof currentStage !== 'undefined' && currentStage === 3) {
            // ステージ4（インデックス3）: デンセツノキシ戦 → 用意されていたラスボス.mp3
            stage4BossAudio.currentTime = 0;
            stage4BossAudio.play().catch(e => console.log('Stage 4 Audio play failed:', e));
        } else if (typeof currentStage !== 'undefined' && currentStage === 4) {
            // ステージ5（インデックス4）: ラストライオン戦 → 新規作成の真ラスボスBGM
            TrueLastBossSequencer.start();
        } else {
            // その他のステージ
            BGMSequencer.start();
        }
    } else {
        // 通常モード
        BGMSequencer.start();
    }
};

AudioEngine.stopBGM = function() {
    BGMSequencer.stop();
    TrueLastBossSequencer.stop();
    stage4BossAudio.pause();
};
