let score = 0;

const choices = document.querySelectorAll(".choice");
const scoreDisplay = document.querySelector("#userscore");
const msgDisplay = document.querySelector("#msg");

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
    // Calculate score change
    let change = 0;
    
    // Reset classes for score change display
    scoreChangeDisplay.className = "score-change";

    if (result === "win") {
        change = 1;
        score += change;
        resultTitle.textContent = "YOU WIN!";
        scoreChangeDisplay.textContent = "+1";
        scoreChangeDisplay.classList.add("win");
        resultMsg.textContent = `${capitalize(userChoice)} beats ${capitalize(compChoice)}`;
    } else if (result === "loss") {
        change = -1;
        score += change;
        resultTitle.textContent = "YOU LOSE!";
        scoreChangeDisplay.textContent = "-1";
        scoreChangeDisplay.classList.add("loss");
        resultMsg.textContent = `${capitalize(compChoice)} beats ${capitalize(userChoice)}`;
    } else {
        change = 0;
        // Score doesn't change on draw
        resultTitle.textContent = "IT'S A DRAW!";
        scoreChangeDisplay.textContent = "+0";
        scoreChangeDisplay.classList.add("draw");
        resultMsg.textContent = `You both chose ${capitalize(userChoice)}`;
    }

    // Update main scoreboard
    scoreDisplay.innerText = score;
    
    // Show Modal
    resultModal.classList.remove("hidden");
};

const capitalize = (word) => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
};

