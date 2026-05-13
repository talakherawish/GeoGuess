const ROUND_SECONDS = 60;
const AUTO_NEXT_DELAY_MS = 750;
const endMessages = [
    "Tiny quiz. Bigger brain.",
    "That was productive clicking.",
    "Your brain says thank you.",
    "Smarter than yesterday.",
    "Brain exercised successfully. Have a nice day.",
    "You know a little more about the world than you did 3 minutes ago."
];

let countries = [];

const roundOrder = ["flags", "capitals", "countries"];

const modeConfigs = {
    flags: {
        label: "Flags",
        question: "Which country does this flag belong to?",
        answerOf: (country) => country.name,
        pool: countries.map((country) => country.name),
        buildPrompt: (country) => ({
            image: `https://flagcdn.com/w640/${country.code}.png`,
            text: ""
        })
    },
    capitals: {
        label: "Capitals",
        question: "Which country has this capital city?",
        answerOf: (country) => country.name,
        pool: countries.map((country) => country.name),
        buildPrompt: (country) => ({
            image: null,
            text: country.capital
        })
    },
    countries: {
        label: "Countries",
        question: "What is the capital city of this country?",
        answerOf: (country) => country.capital,
        pool: countries.map((country) => country.capital),
        buildPrompt: (country) => ({
            image: null,
            text: country.name
        })
    }
};

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const roundActionBtn = document.getElementById("round-action-btn");

const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const roundLabelEl = document.getElementById("round-label");
const statusEl = document.getElementById("status-text");

const questionEl = document.getElementById("question");
const promptTextEl = document.getElementById("prompt-text");
const flagEl = document.getElementById("flag");
const optionButtons = Array.from(document.querySelectorAll(".option-btn"));

const finalScoreEl = document.getElementById("final-score");
const endMessageEl = document.getElementById("end-message");
const themeToggle = document.getElementById("theme-toggle");

const progressEls = [
    document.getElementById("progress-flags"),
    document.getElementById("progress-capitals"),
    document.getElementById("progress-countries")
];

let score = 0;
let roundIndex = 0;
let timeLeft = ROUND_SECONDS;
let timerId;
let roundActive = false;
let questionLocked = false;
let currentCorrectAnswer = "";

//asynchrounous function means it contains waiting opertion and to be able to use await we need async
async function fetchCountries() {

    const response = await fetch(
        // fetch() means sends HTTP request to the API server (Equivalent to GET https://...)
        // await means wait until the server responds
        "https://api.countrystatecity.in/v1/countries",  //endpoint
        {
            headers: { "X-CSCAPI-KEY": "f564f0796fb4c157ee7a41044ecb59bc87993ea1ac762047d160c6c9d4bbee94" }
        }
        ,)

    const data = await response.json();
    //the api sends bakc json this line converts that JSON into JavaScript objects/arrays.
    countries = data.map(country => ({
        name: country.name,
        code: country.iso2.toLowerCase()
    }));
    console.log(data); //print in console to make sure it worked

}

function showScreen(screen) {
    startScreen.classList.remove("active");
    gameScreen.classList.remove("active");
    endScreen.classList.remove("active");
    screen.classList.add("active");
}

function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function randomCountry() {
    return countries[Math.floor(Math.random() * countries.length)];
}

function updateProgress() {
    progressEls.forEach((el, index) => {
        el.classList.remove("active", "done");
        if (index < roundIndex) {
            el.classList.add("done");
        } else if (index === roundIndex) {
            el.classList.add("active");
        }
    });
}

function setAnswerButtonsDisabled(disabled) {
    optionButtons.forEach((button) => {
        button.disabled = disabled;
        button.classList.remove("correct", "wrong");
        if (disabled) {
            button.textContent = "-";
        }
    });
}

function prepareRound(customStatusText) {
    clearInterval(timerId);
    timerId = undefined;

    if (roundIndex >= roundOrder.length) {
        endGame();
        return;
    }

    roundActive = false;
    questionLocked = false;
    timeLeft = ROUND_SECONDS;

    const roundKey = roundOrder[roundIndex];
    const config = modeConfigs[roundKey];

    roundLabelEl.textContent = config.label;
    timerEl.textContent = String(timeLeft);
    scoreEl.textContent = String(score);

    updateProgress();

    questionEl.textContent = config.question;
    promptTextEl.textContent = customStatusText || `Round ${roundIndex + 1} of ${roundOrder.length}`;
    flagEl.classList.add("hidden");

    setAnswerButtonsDisabled(true);

    statusEl.textContent = customStatusText || `Press start to begin the ${config.label} round.`;
    roundActionBtn.textContent = `Start ${config.label} Round`;
    roundActionBtn.style.display = "inline-block";
}

function buildChoices(config, correctAnswer) {
    const allAnswers = countries.map(country => country.name); //1. take ALL country names
    const wrongPool = allAnswers.filter(answer => answer !== correctAnswer); //2. remove the correct answer
    const wrongChoices = shuffle(wrongPool).slice(0, 3);//3. pick 3 random wrong answers
    const finalChoices = shuffle([correctAnswer, ...wrongChoices //4. add correct answer and shuffle again
    ]);
    return finalChoices;
}

function loadQuestion() {
    const roundKey = roundOrder[roundIndex];
    const config = modeConfigs[roundKey];

    const country = randomCountry();
    const prompt = config.buildPrompt(country);
    const correctAnswer = config.answerOf(country);
    const choices = buildChoices(config, correctAnswer);

    currentCorrectAnswer = correctAnswer;

    questionEl.textContent = config.question;
    promptTextEl.textContent = prompt.text || "";

    if (prompt.image) {
        flagEl.src = prompt.image;
        flagEl.alt = `${country.name} flag`;
        flagEl.classList.remove("hidden");
    } else {
        flagEl.classList.add("hidden");
    }

    optionButtons.forEach((button, index) => {
        button.disabled = false;
        button.classList.remove("correct", "wrong");
        button.textContent = choices[index];
    });
}

function finishRound() {
    clearInterval(timerId);
    timerId = undefined;

    roundActive = false;
    questionLocked = false;

    optionButtons.forEach((button) => {
        button.disabled = true;
    });

    const finishedRound = modeConfigs[roundOrder[roundIndex]].label;

    if (roundIndex < roundOrder.length - 1) {
        roundIndex += 1;
        const nextRound = modeConfigs[roundOrder[roundIndex]].label;
        prepareRound(`${finishedRound} done. Press start for ${nextRound}.`);
        return;
    }

    roundIndex += 1;
    endGame();
}

function startRoundTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft -= 1;
        timerEl.textContent = String(timeLeft);

        if (timeLeft <= 0) {
            finishRound();
        }
    }, 1000);
}

function startRound() {
    if (roundIndex >= roundOrder.length) {
        return;
    }

    roundActive = true;
    questionLocked = false;

    const currentLabel = modeConfigs[roundOrder[roundIndex]].label;
    statusEl.textContent = `${currentLabel} round in progress...`;
    roundActionBtn.style.display = "none";

    loadQuestion();
    startRoundTimer();
}

function startChallenge(autoStartFirstRound = false) {
    score = 0;
    roundIndex = 0;

    showScreen(gameScreen);
    prepareRound();

    if (autoStartFirstRound) {
        startRound();
    }
}

function endGame() {
    clearInterval(timerId);
    timerId = undefined;

    finalScoreEl.textContent = `Final Score after 3 rounds: ${score}`;
    const randomMessage = endMessages[Math.floor(Math.random() * endMessages.length)];
    endMessageEl.textContent = randomMessage;
    showScreen(endScreen);
    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });

}

function onAnswerClick(button) {
    if (!roundActive || questionLocked) {
        return;
    }

    questionLocked = true;

    const selected = button.textContent;
    const isCorrect = selected === currentCorrectAnswer;

    if (isCorrect) {
        score += 1;
        scoreEl.textContent = String(score);
    }

    optionButtons.forEach((btn) => {
        btn.disabled = true;
        const isTheCorrect = btn.textContent === currentCorrectAnswer;

        if (isTheCorrect) {
            btn.classList.add("correct");
        } else if (btn === button && !isCorrect) {
            btn.classList.add("wrong");
        }
    });

    setTimeout(() => {
        if (!roundActive || timeLeft <= 0) {
            return;
        }

        questionLocked = false;
        loadQuestion();
    }, AUTO_NEXT_DELAY_MS);
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    themeToggle.textContent = document.body.classList.contains("light-mode") ? "☀️" : "🌙";
});

startBtn.addEventListener("click", () => startChallenge(true));
restartBtn.addEventListener("click", () => startChallenge(true));
roundActionBtn.addEventListener("click", startRound);

optionButtons.forEach((button) => {
    button.addEventListener("click", () => onAnswerClick(button));
});
fetchCountries();