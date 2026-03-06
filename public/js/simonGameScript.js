let gameSeq = [];
let userSeq = [];

let btns = ["item1", "item2", "item3", "item4"];

let started = false;
let level = 0;

let h3 = document.querySelector("#level-title");

document.addEventListener("keypress", function () {
    if (started == false) {
        console.log("game is started");
        started = true;

        levelUp();
    }
});

function gameFlash(btn) {
    btn.classList.add("flash");
    setTimeout(function () {
        btn.classList.remove("flash");
    }, 250);
}

function userFlash(btn) {
    btn.classList.add("userflash");
    setTimeout(function () {
        btn.classList.remove("userflash");
    }, 250);
}

function levelUp() {
    userSeq = [];
    level++;
    h3.innerText = `Level ${level}`;

    let randIdx = Math.floor(Math.random() * 4);
    let randColor = btns[randIdx];
    gameSeq.push(randColor);
    console.log(gameSeq);

    // Flash the new sequence button
    let i = 0;
    
    // Use an interval to flash buttons one by one from the gameSeq array
    let flashInterval = setInterval(() => {
        if (i < gameSeq.length) {
            let btn = document.querySelector(`#${gameSeq[i]}`);
            gameFlash(btn);
            i++;
        } else {
            clearInterval(flashInterval);
        }
    }, 1000);
}

async function updateScoreInDB(score) {
    try {
        const response = await fetch('/games/updateUserScore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: 'simonGame', score: score })
        });
        const data = await response.json();
        const scoreEl = document.getElementById("simon-score");
        if (data.totalScore !== undefined && scoreEl) {
             scoreEl.innerText = data.totalScore;
        }
    } catch (e) { console.error(e); }
}

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length == gameSeq.length) {
            setTimeout(levelUp, 1000);
        }
    } else {
        let score = level - 1;
        if(score > 0) updateScoreInDB(score); // Send score update

        h3.innerHTML = `Game Over! Your score was <b>${score}</b> <br> Press any key to start.`;
        document.querySelector("body").style.backgroundColor = "red";
        setTimeout(function () {
            document.querySelector("body").style.backgroundColor = ""; // Reset to CSS default
        }, 150);
        
        reset();
    }
}

function btnPress() {
    let btn = this;
    userFlash(btn);

    userColor = btn.getAttribute("id");
    userSeq.push(userColor);

    checkAns(userSeq.length - 1);
}

let allBtns = document.querySelectorAll(".items");
for (let btn of allBtns) {
    btn.addEventListener("click", btnPress);
}

function reset() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
}