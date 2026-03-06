let userScore=0;
let compScore=0;

const choices=document.querySelectorAll(".choice");
const msg=document.querySelector("#msg");
const US=document.querySelector("#userscore");
const CS=document.querySelector("#compscore");


choices.forEach((choice)=>{
    choice.addEventListener("click",()=>{
        const userChoice=choice.getAttribute("id");
        playGame(userChoice);
    });
});

const genCompChoice=()=>{
    const options=["rock","paper","scissors"];
    return options[Math.floor(Math.random()*3)];
};

const drawGame=()=>{
    msg.innerText="Game was draw.";
    msg.style.backgroundColor="#081b31";
};

const showWinner=(userWin,userChoice,compChoice)=>{
    if(userWin){
        userScore++;
        US.innerText=userScore;
        msg.innerText=`You win! Your ${userChoice} beats computer's ${compChoice}`;
        msg.style.backgroundColor="green";
    }
    else{
        compScore++;
        CS.innerText=compScore;
        msg.innerText=`You lost. Computer's ${compChoice} beats your ${userChoice}`;
        msg.style.backgroundColor="red";
    }
};

const playGame=(userChoice)=>{
    //Generate Computer Choice
    const compChoice=genCompChoice();
    if(userChoice===compChoice){
        drawGame();
    }
    else{
        let userWin=true;
        if(userChoice==="rock"){
            userWin=compChoice==="paper"?false:true;
        }
        else if(userChoice==="paper"){
            userWin=compChoice==="scissors"?false:true;
        }
        else{
            userWin=compChoice==="rock"?false:true;
        }
        showWinner(userWin,userChoice,compChoice);
    }
};

