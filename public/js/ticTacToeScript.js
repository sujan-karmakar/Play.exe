const boxes = Array.from(document.querySelectorAll(".box"));
const resetBtn = document.querySelector("#reset");
const newGameBtn = document.querySelector("#new-btn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");
const userScoreEl = document.querySelector("#user-score");

let sessionScore = 0;
userScoreEl.innerText = sessionScore;

let isGameActive = true;
let isUserTurn = true; // User (X) starts

async function updateScoreInDB(currentSessionScore) {
    try {
        const response = await fetch('/games/updateUserScore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: 'ticTacToe', score: currentSessionScore })
        });
        // We don't overwrite sessionScore with totalScore anymore
    } catch (e) {
         console.error(e); 
    }
}

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
        // Score logic: Simple +1 per win in this session
        sessionScore++;
        userScoreEl.innerText = sessionScore;
        updateScoreInDB(sessionScore);
        
        msg.innerText = `You Won!`;
    } else if (result === "O") {
        // Computer Wins
        msg.innerText = "Game Over!";
    } else {
        // Draw
        msg.innerText = "It's a Draw!";
    }
    
    msgContainer.classList.remove("hide");
    disableBoxes(); // Ensure no more clicks
    
    // Add Home Button if missing (for user navigation)
    const popup = document.querySelector(".winner-popup");
    if (popup && !document.querySelector("#homeBtnTTT")) {
        const homeBtn = document.createElement("button");
        homeBtn.id = "homeBtnTTT";
        homeBtn.innerText = "Home";
        homeBtn.className = "game-btn";
        homeBtn.style.marginTop = "10px";
        homeBtn.style.backgroundColor = "var(--text-color)"; // darker
        homeBtn.style.color = "var(--surface-color)";
        homeBtn.onclick = () => window.location.href = "/";
        popup.appendChild(homeBtn);
    }
};

const findWinningMove = (player) => {
    // Check all winning patterns to see if 'player' can win in one move
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const boxA = boxes[a].innerText;
        const boxB = boxes[b].innerText;
        const boxC = boxes[c].innerText;

        // Pattern: [X, X, empty] or [O, O, empty] etc.
        if (boxA === player && boxB === player && boxC === "") return c;
        if (boxA === player && boxC === player && boxB === "") return b;
        if (boxB === player && boxC === player && boxA === "") return a;
    }
    return null;
};

const computerMove = () => {
    if (!isGameActive) return;

    setTimeout(() => {
        if (!isGameActive) return;

        let choice = null;

        // 1. Check if Computer can win NOW (90% chance to execute)
        if (Math.random() < 0.9) {
            choice = findWinningMove("O");
        }

        // 2. If not, check if User is about to win and BLOCK them (70% chance to execute)
        if (choice === null && Math.random() < 0.7) {
            choice = findWinningMove("X");
        }

        // 3. Take Center if available (80% chance)
        if (choice === null && boxes[4].innerText === "" && Math.random() < 0.8) {
            choice = 4;
        }

        // 4. If still no choice, pick RANDOM available box
        if (choice === null) {
            const emptyIndices = boxes.map((box, idx) => box.innerText === "" ? idx : null).filter(val => val !== null);
            if (emptyIndices.length > 0) {
                choice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            }
        }

        // Apply Move
        if (choice !== null) {
            const box = boxes[choice];
            box.innerText = "O";
            box.classList.add("player-o");
            box.disabled = true;

            if (checkWinner("O")) {
                endGame("O");
            } else if (checkDraw()) {
                endGame("Draw");
            } else {
                isUserTurn = true; // Back to user
            }
        }
    }, 600); // 600ms thinks time
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