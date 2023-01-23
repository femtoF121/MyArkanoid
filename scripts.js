var gameOverWindow = document.querySelector(".game-over");
var main = document.querySelector("main");
var header = document.querySelector("header");
var lifes = document.querySelector(".life-container");
var tilesField = document.querySelector(".tiles-field");
var game = {
    width: 1000,
    height: 640,
    lifes: 0,
}

//#region Vaus
var pressedLeft = false;
var pressedRight = false;
var goingLeft;
var goingRight;
var moveSpeed = 2;
var ballSpeed = 3;
var vaus = {
    element: document.querySelector(".vaus"),    
    left: 5,
    top: 600,
    width: 140,
    height: 20
} 

function moveRight() {
    if(vaus.left < game.width - vaus.width - 5) {
        vaus.left += moveSpeed;
        vaus.element.style.left = vaus.left + "px";
        if(!isLaunched) moveBallWithVaus(true);
    }
}

function moveLeft() {
    if(vaus.left > 5) {
        vaus.left -= moveSpeed;
        vaus.element.style.left = vaus.left + "px";
        if(!isLaunched) moveBallWithVaus(false);
    }
}

function detectMovement(code) {
    document.addEventListener('keyup', keyUp);
    if(code == "ArrowLeft") {
        pressedLeft = true;
        goingLeft = setInterval(moveLeft, 1);
    }
    if(code == "ArrowRight") {
        pressedRight = true;
        goingRight = setInterval(moveRight, 1);
    }
}

function keyUp(event) {
    if(event.code == "ArrowLeft") {
        pressedLeft = false;
        clearInterval(goingLeft);
    }
    if(event.code == "ArrowRight") {
        pressedRight = false;
        clearInterval(goingRight);
    }
}
//#endregion Vaus

//#region Ball
var isLaunched = false;
var ball = {
    element: document.querySelector(".ball"),
    left: 0,
    top: 0,
    radius: 10,
    diametr: 20,
    moving: 0
}

function setCoordinatesForBall (left = (vaus.left + vaus.width / 2 - ball.radius), top = (vaus.top - ball.diametr)) {
    ball.left = left;
    ball.top = top;
    ball.element.style.left = left + "px";
    ball.element.style.top = top + "px";
}

function moveBallWithVaus(isGoingRight) {
    if(isGoingRight) ball.left += moveSpeed; 
    else ball.left -= moveSpeed;
    setCoordinatesForBall(ball.left, ball.top);
}

function launch(event) {
    if(event.code == "Space" && !isLaunched) {
        isLaunched = true;
        moveBall(getStartAngle());
    }
}

function moveBall(goingDegree) {
    let bounceRadian = goingDegree * Math.PI / 180;
    ball.top -= ballSpeed * Math.cos(bounceRadian);
    ball.left += ballSpeed * Math.sin(bounceRadian);
    ball.element.style.top = ball.top + "px";
    ball.element.style.left = ball.left + "px";
    if(ball.top > game.height - ball.diametr || ball.left < -3 || ball.left > game.width - ball.diametr + 4) return loseLife();
    ball.moving = setTimeout(moveBall, 2, bounceChecking(goingDegree));
}

function bounceChecking(goingDegree) {
    if(ball.top < 1) goingDegree = bounce(goingDegree, false);
    if(ball.left < 1 || ball.left > game.width - ball.diametr - 1) 
        goingDegree = bounce(goingDegree, true);
    if((ball.left + ball.radius >= vaus.left - 8 && ball.left + ball.radius < vaus.left + vaus.width + 8) 
        && (ball.top + ball.diametr > vaus.top + 2.7 && ball.top + ball.diametr <= vaus.top + 3.2)) 
        goingDegree = bounce(goingDegree, false, playerChangingCoefficient());    
    if((ball.left + ball.radius >= vaus.left - 1 && ball.left <= vaus.left + vaus.width + 1)
        && (ball.top + ball.diametr > vaus.top + 7 && ball.top <= vaus.top + vaus.height - 5)) {
            goingDegree = bounce(goingDegree, true);
            ball.left += ballSpeed * 3 * Math.sin(goingDegree * Math.PI / 180);
            ball.element.style.left = ball.left + "px";
        } 
    return goingDegree;
}

function getStartAngle (coefficient = 30) {
    let rand = Math.random() * coefficient;
    if(rand >= coefficient/2) return 360 - (coefficient - rand);
    else return rand;
}

function bounce (goingDegree, isVertical, playerChangingCoefficient = 0) {
    let angleForPeriod = goingDegree;
    let goingDegreeAfterBounce = 0;
    let period = 0;
    while (angleForPeriod >= 90) {
        period++;
        angleForPeriod = angleForPeriod - 90;
    }
    if(period % 2 == 1) goingDegreeAfterBounce = goingDegree - angleForPeriod * 2 + (angleForPeriod * playerChangingCoefficient);
    if(period % 2 == 0)  goingDegreeAfterBounce = goingDegree + (90 - angleForPeriod) * 2 + ((90 - angleForPeriod) * playerChangingCoefficient);
    if(isVertical) goingDegreeAfterBounce += 180;
    while (goingDegreeAfterBounce >= 360) goingDegreeAfterBounce -=360;
    while (goingDegreeAfterBounce < 0) goingDegreeAfterBounce +=360;
    return goingDegreeAfterBounce; 

}

function playerChangingCoefficient () {
    let bouncingSpot = ball.left + ball.radius - vaus.left;
    let deviationСoefficient = (vaus.width + 20) / 8;
    if(bouncingSpot >= vaus.width / 2) return Math.pow(Math.E, -(vaus.width - bouncingSpot)/deviationСoefficient);
    else return -(Math.pow(Math.E, -(bouncingSpot)/deviationСoefficient));
}
//#endregion Ball

function onLoad() {
    addLife(3);
    setCoordinatesForBall();
    document.addEventListener("keydown", keysPressedCheck);
    document.addEventListener("keydown", launch);
    loadTiles(level1);
}

function loadTiles(level) {
    let left = 0;
    let top = 0;
    level.forEach(row => {
        row.forEach(tile => {
            tilesField.innerHTML += '<div class="tile ' + tile.color + '" style="left:' + left + 'px; top:' + top + 'px"></div>';
            left += 100;
        });
        top += 30;
        left = 0;
    });
    
    
}

function loseLife() {
    lifes.querySelector(".life").remove();
    setCoordinatesForBall();
    isLaunched = false;
    if(--game.lifes == 0) return gameOver();
}

function addLife(amount = 1) {
    for(let i = 0; i < amount; i++){
        lifes.innerHTML += '<div class="life"></div>';
        game.lifes++;
    }
}
function gameOver() {
    clearTimeout(ball.moving);
    document.removeEventListener("keydown", launch);
    document.removeEventListener("keydown", keysPressedCheck);
    keyUp({code: "ArrowLeft"});
    keyUp({code: "ArrowRight"});
    isLaunched = false;
    gameOverWindow.style.visibility = "visible";
    main.style.filter = "blur(5px)";
    header.style.filter = "blur(5px)";
}

function playAgain() {
    addLife(3);
    setCoordinatesForBall();
    document.addEventListener("keydown", keysPressedCheck);
    document.addEventListener("keydown", launch);
    gameOverWindow.style.visibility = "hidden";
    main.style.filter = "none";
    header.style.filter = "none";
}
const keysPressedCheck = (event)=>{ if(!pressedLeft && !pressedRight) detectMovement(event.code); }
const exit = ()=>{ window.close();}

//#region level
const level1 = [
    [
        {color: 'red'}, {color: 'green'}, {color: 'blue'}, {color: 'aqua'}, {color: 'yellow'}, 
        {color: 'purple'}, {color: 'red'}, {color: 'green'}, {color: 'blue'}, {color: 'aqua'}
    ], 
    [
        {color: 'yellow'}, {color: 'purple'}, {color: 'red'}, {color: 'green'}, {color: 'blue'},
        {color: 'aqua'}, {color: 'yellow'}, {color: 'purple'}
    ]
    
    ]
//#endregion level