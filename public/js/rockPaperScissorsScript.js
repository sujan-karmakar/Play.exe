const scoreDisplay = document.querySelector("#userscore");
// Initialize session score to 0
let score = 0;
// We start fresh session
scoreDisplay.innerText = score;

const choices = document.querySelectorAll(".choice");
const msgDisplay = document.querySelector("#msg");

async function updateScoreInDB(currentSessionScore) {
    try {
        const response = await fetch('/games/updateUserScore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: 'rockPaperScissors', score: currentSessionScore })
        });
        // DB keeps max, we keep counting session score
    } catch (e) {
        console.error("Failed to update score", e);
    }
}

// Modal Elements
const resultModal = document.querySelector(".result-modal");
const resultTitle = document.querySelector("#resultTitle");
const scoreChangeDisplay = document.querySelector("#scoreChange");
const resultMsg = document.querySelector("#resultMsg");
const playAgainBtn = document.querySelector("#playAgainBtn");

// Event Listeners for Choices
choices.forEach((choice) => {
    choice.addEventListener("click", () => {
        const userChoice = choice.getAttribute("id");
        playGame(userChoice);
    });
});

// Event Listener for Play Again
if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
        resultModal.classList.add("hidden");
        msgDisplay.textContent = "Make your move!"; // Reset message
        msgDisplay.style.color = "var(--text-color)";
    });
}

const genCompChoice = () => {
    const options = ["rock", "paper", "scissors"];
    return options[Math.floor(Math.random() * 3)];
};

const playGame = (userChoice) => {
    const compChoice = genCompChoice();

    if (userChoice === compChoice) {
        showResult("draw", userChoice, compChoice);
    } else {
        let userWin = true;
        if (userChoice === "rock") {
            userWin = compChoice === "paper" ? false : true;
        } else if (userChoice === "paper") {
            userWin = compChoice === "scissors" ? false : true;
        } else {
            // userChoice === "scissors"
            userWin = compChoice === "rock" ? false : true;
        }
        showResult(userWin ? "win" : "loss", userChoice, compChoice);
    }
};

const showResult = (result, userChoice, compChoice) => {
    // Reset classes for score change display
    scoreChangeDisplay.className = "score-change";

    if (result === "win") {
        score++;
        resultTitle.textContent = "YOU WIN!";
        scoreChangeDisplay.textContent = "+1";
        scoreChangeDisplay.classList.add("win");
        resultMsg.textContent = `${capitalize(userChoice)} beats ${capitalize(compChoice)}`;
    } else if (result === "loss") {
        // Option: Do we decrease score in session max mode? 
        // Typically max score runs don't decrease on loss but restart or just stop increasing.
        // User said "Take his score in that session... compare with highest".
        // If I lose, my session score usually drops or I lose the streak.
        // Let's assume standard points: Win=+1, Loss=-1 (min 0) or just Win counting?
        // Let's stick to +1/-1 but min 0 for session.
        if(score > 0) score--;
        resultTitle.textContent = "YOU LOSE!";
        scoreChangeDisplay.textContent = "-1";
        scoreChangeDisplay.classList.add("loss");
        resultMsg.textContent = `${capitalize(compChoice)} beats ${capitalize(userChoice)}`;
    } else {
        // Score doesn't change on draw
        resultTitle.textContent = "IT'S A DRAW!";
        scoreChangeDisplay.textContent = "+0";
        scoreChangeDisplay.classList.add("draw");
        resultMsg.textContent = `You both chose ${capitalize(userChoice)}`;
    }

    // Send TOTAL session score to update (Backend will check if it's a new High Score)
    updateScoreInDB(score);

    // Update main scoreboard locally
    scoreDisplay.innerText = score;
    
    // Show Modal
    resultModal.classList.remove("hidden");

    // Add Home Button to Modal if not exists
    if (!document.querySelector("#homeBtnModal")) {
        const homeBtn = document.createElement("button");
        homeBtn.id = "homeBtnModal";
        homeBtn.innerText = "Home";
        homeBtn.className = "game-btn"; 
        homeBtn.style.backgroundColor = "var(--text-color)";
        homeBtn.style.color = "var(--surface-color)";
        homeBtn.style.marginTop = "10px";
        homeBtn.style.marginLeft = "10px";
        homeBtn.onclick = () => window.location.href = "/";
        
        // Append next to Play Again
        playAgainBtn.parentNode.appendChild(homeBtn);
    }
};


const capitalize = (word) => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
};

