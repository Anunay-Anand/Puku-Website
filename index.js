// --------- Config ----------
const quizData = [
    { question: "Who is my favoraite?", answers: ["Puku Baby", "Samiksha chan", "Nuvika", "Puchku"] },
    { question: "When is our anniversary?", answers: ["Oct 2nd", "Aug 15th", "July 20th", "Oct 11th"] },
    { question: "Puku is the better half of the halves we are?", answers: ["true", "false"] },
    { question: "Who loves more in both of us?", answers: ["Puku Baby", "Puku Babyyy"] }
];
const rewards = [
    "🍰 Cheesecake of your choice!!",
    "🎤 Record an 'I love you Puku' song and send it",
    "💃 Dance to Puku's tunes and show your moves",
    "😂 Send funny pics to make Puku laugh",
    "🍳 Cook for Puku when you're at her place",
    "🙏 Say sorry for whatever happens in the next one hour",
    "🎬 Take her on a movie date next week",
    "🌄 Take her on some fun adventure",
    "❤️ Tell her you love her and cuddle up, baby girl",
    "🔥 Make her melt with your name (wink)"
];
// keep images in folder as requested (relative paths)
const images = [
    "images/SequenceGame/IMG_20241002_232345.jpg",
    "images/SequenceGame/8BD87B74-8BDE-4CF2-9FBF-1171A2ED51A5.jpeg",
    "images/SequenceGame/IMG-20241220-WA0139.jpg",
    "images/SequenceGame/IMG_20241207_181803.jpg",
    "images/SequenceGame/IMG-20241225-WA0127.jpg",
    "images/SequenceGame/Snapchat-2127376322.jpg",
    "images/SequenceGame/Snapchat-1729979077.jpg",
    "images/SequenceGame/Snapchat-1743923237.jpg",
    "images/SequenceGame/Snapchat-576221581.jpg"
];

// --------- state ----------
let quizIndex = 0, quizScore = 0, quizWon = false;
let seqCorrect = [...images]; // correct order
let seqPlaced = []; // full src strings
let seqScore = 0, seqWon = false;
let wonQuizOnce = false, wonSeqOnce = false; // track wins this session

// UI refs
const intro = document.getElementById('introSection');
const menuBox = document.getElementById('menuBox');
const quizPanel = document.getElementById('quizPanel');
const sequencePanel = document.getElementById('sequencePanel');
const finalPanel = document.getElementById('finalPanel');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const spinBox = document.getElementById('spinBox');
const rewardText = document.getElementById('rewardText');
const quizArea = document.getElementById('quizArea');
const quizScoreEl = document.getElementById('quizScore');
const seqScoreEl = document.getElementById('seqScore');
const imagePool = document.getElementById('imagePool');
const sequenceArea = document.getElementById('sequenceArea');
const sequenceMessage = document.getElementById('sequenceMessage');
const party = document.getElementById('party');

// small UI sound (click/pop) using WebAudio
let audioCtx = null;
function playClick() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = 520;
    g.gain.value = 0.02;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.05);
}

// ---------- helpers ----------
function fadeOut(el, cb) {
    el.style.transition = "opacity .28s, transform .28s";
    el.style.opacity = 0;
    el.style.transform = "translateY(8px)";
    setTimeout(() => { if (cb) cb(); el.style.opacity = ''; el.style.transform = ''; }, 280);
}
function fadeInEl(el) { el.style.opacity = 0; el.style.transform = "translateY(6px)"; setTimeout(() => { el.style.transition = "opacity .28s, transform .28s"; el.style.opacity = 1; el.style.transform = ''; }, 20); }

// ---------- NAV ----------
function hideAllPanels() {
    quizPanel.classList.remove('active');
    sequencePanel.classList.remove('active');
    menuBox.classList.remove('active');
    finalPanel.classList.remove('show');
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
}
function goHome() {
    hideAllPanels();
    intro.style.display = 'block';
    menuBox.classList.add('active');
    finalPanel.classList.remove('show');
    sequenceMessage.innerText = '';
    playClick();
}
function startQuiz() {
    playClick();
    // fade intro/menu
    intro.style.display = 'none';
    menuBox.classList.remove('active');
    quizPanel.classList.add('active');
    quizIndex = 0; quizScore = 0; quizWon = false;
    quizScoreEl.innerText = quizScore;
    renderQuiz();
}
function backToMenuFromQuiz() {
    playClick();
    quizPanel.classList.remove('active');
    intro.style.display = 'block';
    menuBox.classList.add('active');
}
function startSequence() {
    playClick();
    intro.style.display = 'none';
    menuBox.classList.remove('active');
    sequencePanel.classList.add('active');
    seqPlaced = [];
    sequenceArea.innerHTML = '';
    sequenceMessage.innerText = '';
    renderPool();
}
function backToMenuFromSeq() {
    playClick();
    sequencePanel.classList.remove('active');
    intro.style.display = 'block';
    menuBox.classList.add('active');
}

// ---------- QUIZ ----------
function renderQuiz() {
    const q = quizData[quizIndex];
    let html = `<div class="card"><div class="quiz-question"><h3 style="color:var(--pink)">${q.question}</h3><div class="options">`;
    q.answers.forEach(ans => {
        html += `<div class="option" onclick="chooseQuiz('${escapeForJs(ans)}')">${ans}</div>`;
    });
    html += `</div></div></div>`;
    quizArea.innerHTML = html;
}
function escapeForJs(s) { return s.replace(/'/g, "\\'").replace(/"/g, '\\"'); }
function chooseQuiz(ans) {
    playClick();
    quizScore++; quizScoreEl.innerText = quizScore;
    quizIndex++;
    if (quizIndex < quizData.length) {
        setTimeout(() => renderQuiz(), 220);
    } else {
        quizWon = true; wonQuizOnce = true;
        showReward('quiz');
    }
}

// ---------- SEQUENCE POOL ----------
function renderPool() {
    imagePool.innerHTML = '';
    // randomize display
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    shuffled.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'tile';
        img.draggable = true;
        img.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', src);
        });
        imagePool.appendChild(img);
    });
    // sequence area drag handlers
    sequenceArea.addEventListener('dragover', e => e.preventDefault());
    sequenceArea.addEventListener('drop', e => {
        e.preventDefault();
        const src = e.dataTransfer.getData('text/plain');
        if (!seqPlaced.includes(src)) {
            seqPlaced.push(src);
            renderSequenceArea();
        }
    });
}
function renderSequenceArea() {
    sequenceArea.innerHTML = '';
    seqPlaced.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'tile';
        // right click removal (contextmenu)
        img.addEventListener('contextmenu', e => {
            e.preventDefault();
            seqPlaced = seqPlaced.filter(s => s !== src);
            renderSequenceArea();
        });
        sequenceArea.appendChild(img);
    });
}
// ---------- CHECK SEQUENCE ----------
function checkSequence() {
    playClick();
    // compare filenames
    const placedNames = seqPlaced.map(s => s.split('/').pop());
    const correctNames = seqCorrect.map(s => s.split('/').pop());
    if (JSON.stringify(placedNames) === JSON.stringify(correctNames)) {
        seqScore++; seqScoreEl.innerText = seqScore;
        seqWon = true; wonSeqOnce = true;
        showReward('sequence');
    } else {
        sequenceMessage.innerText = "Not quite — try again, baby 😘";
        // small shake animation
        sequenceArea.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], { duration: 420 });
    }
}

// ---------- REWARD + OVERLAY ----------
function showReward(source) {
    // source: 'quiz' or 'sequence'
    overlay.classList.add('show');
    overlayText.innerText = "Whatever Puku says... she is always right 💖 You Win!!";
    rewardText.innerText = "";
    spinBox.style.display = 'block';
    // spin animation then show reward text
    setTimeout(() => {
        spinBox.style.display = 'none';
        const r = rewards[Math.floor(Math.random() * rewards.length)];
        rewardText.innerText = r;
        // if both won in this session, show final after a pause
        if (wonQuizOnce && wonSeqOnce) {
            setTimeout(() => showFinalUnlock(), 1200);
        }
    }, 1300);
    playClick();
}
function closeOverlay() {
    overlay.classList.remove('show');
    rewardText.innerText = '';
    spinBox.style.display = 'none';
}

// ---------- FINAL UNLOCK ----------
function showFinalUnlock() {
    // show party hearts/sparkles
    createParty();
    // show big final message
    finalPanel.classList.add('show');
    // hide other panels/menu
    intro.style.display = 'none';
    menuBox.classList.remove('active');
    quizPanel.classList.remove('active');
    sequencePanel.classList.remove('active');
    // autoplay small success tone
    playSuccessTone();
}

// ---------- party visuals ----------
function createParty() {
    party.innerHTML = '';
    // hearts floating
    for (let i = 0; i < 28; i++) {
        const h = document.createElement('div');
        h.className = 'heart';
        const left = Math.random() * 100;
        const size = 8 + Math.random() * 28;
        h.style.left = left + '%';
        h.style.width = size + 'px';
        h.style.height = size + 'px';
        h.style.top = (100 + Math.random() * 40) + '%';
        h.style.background = `hsl(${Math.random() * 360},80%,75%)`;
        party.appendChild(h);
        // animate up
        const dur = 3500 + Math.random() * 2500;
        h.animate([
            { transform: `translateY(0) rotate(45deg)`, opacity: 1 },
            { transform: `translateY(-${600 + Math.random() * 300}px) rotate(45deg)`, opacity: 0.1 }
        ], { duration: dur, iterations: 1, easing: 'cubic-bezier(.2,.8,.2,1)' });
        setTimeout(() => h.remove(), dur + 120);
    }
    // sparkles
    for (let i = 0; i < 18; i++) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 80 + '%';
        s.style.background = ['#ffd700', '#fff8c4', '#ffd6e6'][Math.floor(Math.random() * 3)];
        party.appendChild(s);
        const d = 800 + Math.random() * 1200;
        s.animate([{ transform: 'scale(.2)', opacity: 0.2 }, { transform: 'scale(1.1)', opacity: 1 }, { transform: 'scale(0.2)', opacity: 0 }], { duration: d, iterations: 1 });
        setTimeout(() => s.remove(), d + 100);
    }
    // remove after 6s
    setTimeout(() => party.innerHTML = '', 6500);
}

// ---------- small success tone ----------
function playSuccessTone() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(520, audioCtx.currentTime);
    g.gain.value = 0.02;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.frequency.exponentialRampToValueAtTime(820, audioCtx.currentTime + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    setTimeout(() => o.stop(), 700);
}

// ---------- init ----------
(function init() {
    // show intro + menu initially
    intro.style.display = 'block';
    menuBox.classList.add('active');
    // hide panels
    quizPanel.classList.remove('active');
    sequencePanel.classList.remove('active');
    // set initial text
    quizScoreEl.innerText = quizScore;
    seqScoreEl.innerText = seqScore;
})();

// 🎶 MUSIC PLAYER LOGIC
const playlist = [
    { title: "Kahi to Hogi vo", src: "Songs/Kahi to hogi vo.mp3" },
    { title: "Kaise Hua", src: "Songs/KaiseHua - KBSingh.mp3" },
    { title: "Barsega Saawan", src: "Songs/Barsega saawan Trimmed.mp3" },
    { title: "Dil kyu ye mera shor", src: "Songs/dil kyu ye mera shore kare.mp3" }
];
let currentSongIndex = 0;
const audioPlayer = document.getElementById('audio-player');
const currentSongTitle = document.getElementById('current-song');

function loadSong(index) {
    audioPlayer.src = playlist[index].src;
    currentSongTitle.textContent = playlist[index].title;
    audioPlayer.play();
}
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
}
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
}
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
}
// Load first song
loadSong(currentSongIndex);

// 💌 POEM SELECTOR LOGIC
const poems = [
    `In your eyes, I see my home,
In your smile, the sweetest poem.
Through every day, through every night,
You're my heart, my joy, my light.
Whatever comes, we'll always be,
Forever, just you and me. ❤️`,

    `hey i know it's not our day,
i know you aren't okay,
I never knew you were so strong,
one who used to cry when shit went wrong,

You are working so hard,
in front of you i feel like a complete retard,
you know everything don't you,
things that can only be boasted by few,

Stay strong brave girl i won't complain,
but don't shy to cry,
hug me and let go all the pain,
probably you have cried enough that yours tears went dry,

but baby girl you aint shy,
i hope for the best and you know why,
I really love you don't I,
let me be you eyes while you cry ❤️
`,

    `You're confusing,
quite amusing,
Everytime i feel I'm a step closer,
you always knock me over,

You're like mars,
I'm the Mars rover,
you're a sky full of star's,
So drunk on u, just can't get sober,

I know It sounds ridiculous,
so let me ask u to comeover,
to somewhere it's broken, 
but with a lot of leftover,

Do i sound viscous,
It's something i want u to watch over,
it's a bucket full of love,
which i want to spill over
 🌙❤️`
];

function showPoem() {
    const selected = document.getElementById('poem-selector').value;
    document.getElementById('poem-text').innerHTML = poems[selected].replace(/\n/g, "<br>");
}
// Show default poem
showPoem();