const boxes = Array.from(document.querySelectorAll(".box"));
const resetBtn = document.querySelector("#reset");
const newGameBtn = document.querySelector("#new-btn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");
const userScoreEl = document.querySelector("#user-score");

let userScore = 0;
let isGameActive = true;
let isUserTurn = true; // User (X) starts

const winPatterns = [
    [0, 1, 2], [0, 3, 6], [0, 4, 8],
    [1, 4, 7], [2, 5, 8], [2, 4, 6],
    [3, 4, 5], [6, 7, 8]
];

// Initialize Game State
const initGame = () => {
    isUserTurn = true;
    isGameActive = true;
    enableBoxes();
    msgContainer.classList.add("hide");
    msg.innerText = "";
};

// Reset Board
const resetGame = () => {
    // Reset score strictly if requested? Usually reset game just clears board.
    // User probably wants to keep score if "New Game" is clicked?
    // Let's keep score.
    initGame();
};

const disableBoxes = () => {
    boxes.forEach(box => box.disabled = true);
};

const enableBoxes = () => {
    boxes.forEach(box => {
        box.disabled = false;
        box.innerText = "";
        box.classList.remove("player-x", "player-o");
    });
};

const checkWinner = (player) => {
    // Returns true if 'player' ('X' or 'O') has won
    return winPatterns.some(pattern => {
        return pattern.every(index => {
            return boxes[index].innerText === player;
        });
    });
};

const checkDraw = () => {
    return boxes.every(box => box.innerText !== "");
};

const countEmptyCells = () => {
    return boxes.filter(box => box.innerText === "").length;
};

const endGame = (result) => {
    isGameActive = false;
    
    if (result === "X") {
        // User Wins
        const emptyCount = countEmptyCells();
        const points = 1 + emptyCount;
        userScore += points;
        userScoreEl.innerText = userScore;
        msg.innerText = `You Won! (+${points})`;
    } else if (result === "O") {
        // Computer Wins
        msg.innerText = "Game Over!";
    } else {
        // Draw
        msg.innerText = "It's a Draw!";
    }
    
    msgContainer.classList.remove("hide");
    disableBoxes(); // Ensure no more clicks
};

const computerMove = () => {
    if (!isGameActive) return;

    // 1. Get empty indices
    const emptyIndices = boxes
        .map((box, index) => box.innerText === "" ? index : null)
        .filter(val => val !== null);

    if (emptyIndices.length > 0) {
        // 2. Random Choice
        const randomIndex = Math.floor(Math.random() * emptyIndices.length);
        const choice = emptyIndices[randomIndex];

        // 3. Apply Move after delay
        setTimeout(() => {
            if (!isGameActive) return;

            const box = boxes[choice];
            box.innerText = "O";
            box.classList.add("player-o");
            box.disabled = true;

            // 4. Check Result
            if (checkWinner("O")) {
                endGame("O");
            } else if (checkDraw()) {
                endGame("Draw");
            } else {
                isUserTurn = true; // Back to user
            }
        }, 600); // 600ms thinks time
    }
};

const handleUserClick = (box) => {
    if (isUserTurn && isGameActive && box.innerText === "") {
        // 1. User Move
        box.innerText = "X";
        box.classList.add("player-x");
        box.disabled = true;
        isUserTurn = false;

        // 2. Check Result
        if (checkWinner("X")) {
            endGame("X");
        } else if (checkDraw()) {
            endGame("Draw");
        } else {
            // 3. Trigger Computer
            computerMove();
        }
    }
};

// Event Listeners
boxes.forEach((box) => {
    box.addEventListener("click", () => handleUserClick(box));
});

newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);

// Start
initGame();