let randomNumber;
let attempts = 0;
let maxRange = 100;
let targetAttempts = 0;


const setupArea = document.getElementById('setup-area');
const playArea = document.getElementById('play-area');
const maxRangeInput = document.getElementById('maxRangeInput');
const setRangeBtn = document.getElementById('setRangeBtn');
const rangeText = document.getElementById('rangeText');

const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('restartBtn');
const messageEl = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');

 
function initSetup() {
    setupArea.classList.remove('hidden');
    playArea.classList.add('hidden');
    maxRangeInput.value = '';
    maxRangeInput.focus();
}


function startGame() {
    const rangeVal = parseInt(maxRangeInput.value);
    if (isNaN(rangeVal) || rangeVal < 2) {
        alert("Please enter a valid number greater than 1");
        return;
    }
    
    maxRange = rangeVal;
    targetAttempts = Math.ceil(Math.log2(maxRange));

    setupArea.classList.add('hidden');
    playArea.classList.remove('hidden');
    rangeText.textContent = `Pick a number between 1 and ${maxRange}`;
    
    // Update input max attribute
    guessInput.max = maxRange;
    
    resetGameLogic();
}


function resetGameLogic() {
    randomNumber = Math.floor(Math.random() * maxRange) + 1;
    attempts = 0;
    guessInput.value = '';
    guessInput.disabled = false;
    submitBtn.disabled = false;
    restartBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    messageEl.textContent = `Start guessing! (Target: ${targetAttempts} attempts)`;
    messageEl.className = '';
    attemptsEl.textContent = 'Attempts: 0';
    guessInput.focus();
}


function checkGuess() {
    const userGuess = parseInt(guessInput.value);

    if (isNaN(userGuess) || userGuess < 1 || userGuess > maxRange) {
        setMessage(`Please enter a valid number between 1 and ${maxRange}`, 'error');
        return;
    }

    attempts++;
    attemptsEl.textContent = `Attempts: ${attempts}`;

    if (userGuess === randomNumber) {
        // Score = Target Attempts - Actual Attempts + 1
        const score = targetAttempts - attempts + 1;
        endGame(true, score);
    } else if (userGuess < randomNumber) {
        setMessage('Too low! Try a higher number.', 'hint');
        shakeInput();
    } else {
        setMessage('Too high! Try a lower number.', 'hint');
        shakeInput();
    }
    
    guessInput.value = '';
    guessInput.focus();
}


function setMessage(msg, type) {
    messageEl.textContent = msg;
    messageEl.className = type;
}


function endGame(win, score) {
    if (win) {
        const scoreText = score > 0 ? `+${score}` : `${score}`;
        setMessage(`🎉 Correct! The number was ${randomNumber}. Score: ${scoreText} (Efficiency: ${attempts}/${targetAttempts})`, 'success');
    }
    
    guessInput.disabled = true;
    submitBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
}


function shakeInput() {
    guessInput.style.transform = 'translateX(10px)';
    setTimeout(() => {
        guessInput.style.transform = 'translateX(-10px)';
        setTimeout(() => {
            guessInput.style.transform = 'translateX(0)';
        }, 100);
    }, 100);
}


setRangeBtn.addEventListener('click', startGame);
maxRangeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});

submitBtn.addEventListener('click', checkGuess);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

restartBtn.addEventListener('click', initSetup);


document.querySelectorAll('.spin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Prevent focus loss or form submission if inside a form
        e.preventDefault();
        
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const isUp = btn.classList.contains('up');
        
        let currentValue = parseInt(input.value) || 0;
        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || Infinity;
        
        if (isUp) {
            if (currentValue < max) {
                input.value = currentValue + 1;
            }
        } else {
            if (currentValue > min) {
                input.value = currentValue - 1;
            }
        }
        
        
        input.focus();
    });
});


initSetup();