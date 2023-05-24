const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const skybg = new Image();
skybg.src = "img/background.jpg";

const monsterImg = new Image();
monsterImg.src = "img/monster.png";

const jetImg = new Image();
jetImg.src = "img/plane.png";

const rocketImg = new Image();
rocketImg.src = "img/rocket.png";

const flammeImg = new Image();
flammeImg.src = "img/flamme.png";

const explosionImg = new Image();
explosionImg.src = "img/boom.png";

const shieldImg = new Image();
shieldImg.src = "img/shield.png";

const jetSize = 50;
const monsterSize = 100;
const rocketSize = 10;

let isGameOver = false;
let speedBg = 1;
let positionBg = 0;
let timer = 0;
let jet = [
  {
    x: (canvas.width - jetSize) / 2,
    y: canvas.height - jetSize,
    cx: 0,
    cy: 0,
    exist: 0,
    enginesFire: [
      { x: 2, y: jetSize / 2 - 3 },
      { x: -5, y: jetSize / 2 },
      { x: -12, y: jetSize / 2 - 3 },
    ],
    currentFramesFire: [3, 0, 3],
    shot: true,
  },
];
let monster = [];
let rocket = [];
let explosion = [];

let scoreRectangleData = {
  width: 170,
  height: 40,
  textSize: "15px",
  textColor: "red",
  textFont: "Comic Sans MS",
  text: "Enemies Killed:",
  score: 0,
  keyLS: "userScore",
};

canvas.addEventListener("mousemove", (event) => {
  jet[0].x = event.offsetX - 25;
  jet[0].y = event.offsetY - 25;
});
canvas.addEventListener("click", shotOfJet);

skybg.onload = () => {
  game();
};

function game() {
  if (isGameOver) {
    setTimeout(gameOverScreenShow, 1000);

    setTimeout(() => {
      const isNewGame = confirm("Do you want to start again?");
      if (isNewGame) {
        window.location.reload();
      }
    }, 2000);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  render();

  requestAnimationFrameForAll(game);
}

function update() {
  gameOverCondition();

  timer++;

  if (timer % 10 === 0) {
    monster.push({
      x: random(0 + monsterSize / 4, canvas.width - monsterSize / 4),
      y: 0 + monsterSize / 4,
      cx: random(-1, 1),
      cy: random(2, 10),
      exist: 0,
      currentFramesShieldX: 0,
      currentFramesShieldY: 0,
      speedAnimation: random(3, 7) / 10,
      maxFrameX: 2,
      maxFrameY: 1,
      shieldRotation: 0,
    });
  }

  //explosion animation
  explosionAnimationShow();

  // rockets running
  for (let i = 0; i < rocket.length; i++) {
    rocket[i].x += rocket[i].cx;
    rocket[i].y += rocket[i].cy;

    if (rocket[i].y < -rocketSize) {
      rocket.splice(i, 1);
    }
  }

  // monsters running
  for (let i = 0; i < monster.length; i++) {
    shieldAnimation(
      monster[i],
      monster[i].speedAnimation,
      monster[i].maxFrameX,
      monster[i].maxFrameY,
      random(1, 5) / 100
    );
    monster[i].x += monster[i].cx;
    monster[i].y += monster[i].cy;

    if (
      monster[i].x >= canvas.width - monsterSize / 4 ||
      monster[i].x <= 0 + monsterSize / 4
    ) {
      monster[i].cx = -monster[i].cx;
    }

    if (
      monster[i].y >= canvas.height - monsterSize / 4 ||
      monster[i].y <= 0 + monsterSize / 4
    ) {
      monster[i].cy = -monster[i].cy;
    }

    collision(monster[i], rocket, rocketSize);
    collision(monster[i], jet, jetSize, true);

    if (monster[i].exist == 1) {
      scoreRectangleData.score++;
      monster.splice(i, 1);
    }
  }
}

function render() {
  backgroundRun();

  scoreRectangle(scoreRectangleData);

  jetShow();
  jetFire();

  // rocket
  for (let i = 0; i < rocket.length; i++) {
    ctx.drawImage(
      rocketImg,
      rocket[i].x - rocketSize / 2,
      rocket[i].y - rocketSize / 2,
      rocketSize,
      rocketSize
    );
    ctx.beginPath();
    ctx.arc(rocket[i].x, rocket[i].y, rocketSize / 4, 0, 2 * Math.PI);

    // for test
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = "black";
    // ctx.stroke();
  }

  // monster
  for (let i = 0; i < monster.length; i++) {
    ctx.drawImage(
      monsterImg,
      monster[i].x - monsterSize / 2,
      monster[i].y - monsterSize / 2,
      monsterSize,
      monsterSize
    );
    shieldShow(
      monster[i].currentFramesShieldX,
      monster[i].currentFramesShieldY,
      monster[i].x,
      monster[i].y,
      monster[i].shieldRotation
    );
    ctx.beginPath();
    ctx.arc(monster[i].x, monster[i].y, monsterSize / 3.5, 0, 2 * Math.PI);

    // for test
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = "black";
    // ctx.stroke();
  }

  for (let i = 0; i < explosion.length; i++) {
    ctx.drawImage(
      explosionImg,
      192 * Math.floor(explosion[i].cx),
      192 * Math.floor(explosion[i].cy),
      192,
      192,
      explosion[i].x,
      explosion[i].y,
      monsterSize,
      monsterSize
    );
  }
}

function shieldAnimation(
  monsterIndex,
  speedAnimation,
  maxFrameX,
  maxFrameY,
  rotationAnimation
) {
  monsterIndex.shieldRotation += rotationAnimation;
  monsterIndex.currentFramesShieldX += speedAnimation;
  if (monsterIndex.currentFramesShieldX > maxFrameX) {
    monsterIndex.currentFramesShieldY++;
    monsterIndex.currentFramesShieldX = 0;
  }
  if (monsterIndex.currentFramesShieldY > maxFrameY) {
    monsterIndex.currentFramesShieldX = 0;
    monsterIndex.currentFramesShieldY = 0;
  }
  if (monsterIndex.shieldRotation > 50) {
    monsterIndex.shieldRotation = 0;
  }
}

function shieldShow(lineX, lineY, cx, cy, rotationAngle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotationAngle);

  ctx.drawImage(
    shieldImg,
    238 * Math.floor(lineX),
    238 * Math.floor(lineY),
    238,
    238,
    -monsterSize / 4 - 5,
    -monsterSize / 4 - 5,
    60,
    60
  );

  ctx.restore();
}

function explosionAnimationShow() {
  for (let i = 0; i < explosion.length; i++) {
    explosion[i].cx += 0.5;
    if (explosion[i].cx > 4) {
      explosion[i].cy++;
      explosion[i].cx = 0;
    }
    if (explosion[i].cy > 4) {
      explosion.splice(i, 1);
    }
  }
}

function collision(
  monsterIndex,
  objectCollision,
  objectCollisionSize,
  jetKey = false
) {
  for (let i = 0; i < objectCollision.length; i++) {
    let objectCollisionCircle = objectCollision[i];
    let dx = objectCollisionCircle.x - monsterIndex.x;
    let dy = objectCollisionCircle.y - monsterIndex.y;
    let distance = Math.hypot(dx, dy);

    if (distance <= monsterSize / 4 + objectCollisionSize / 2) {
      monsterIndex.exist = 1;
      objectCollision[i].exist = 1;
      explosion.push({
        x: monsterIndex.x - monsterSize / 2,
        y: monsterIndex.y - monsterSize / 2,
        cx: 0,
        cy: 0,
      });

      if (jetKey) {
        explosion.push({
          x: objectCollision[i].x - objectCollisionSize,
          y: objectCollision[i].y - objectCollisionSize,
          cx: 0,
          cy: 0,
        });
      } else {
        objectCollision.splice(i, 1);
      }
      break;
    }
  }
}

function jetFire() {
  if (jet[0].exist === 1) {
    return;
  }
  jet[0].enginesFire.map((engineFire, index) => {
    jet[0].currentFramesFire[index]++;
    fireShow(
      jet[0].currentFramesFire[index],
      jet[0].x + engineFire.x,
      jet[0].y + engineFire.y
    );
    if (jet[0].currentFramesFire[index] >= 6) {
      jet[0].currentFramesFire[index] = 0;
    }
  });
}

function fireShow(currentFrame, cx, cy) {
  ctx.drawImage(flammeImg, 16 * currentFrame, 0, 16, 48, cx, cy, 10, 25);
}

function jetShow() {
  if (jet[0].exist === 1) {
    return;
  }
  ctx.drawImage(
    jetImg,
    jet[0].x - jetSize / 2,
    jet[0].y - jetSize / 2,
    jetSize,
    jetSize
  );
  ctx.beginPath();
  ctx.arc(jet[0].x, jet[0].y, jetSize / 2, 0, 2 * Math.PI);

  // for test
  // ctx.lineWidth = 1;
  // ctx.strokeStyle = "black";
  // ctx.stroke();
}

function shotOfJet() {
  if (jet[0].shot) {
    rocket.push({
      x: jet[0].x - jetSize / 4,
      y: jet[0].y - jetSize / 4,
      cx: -0.5,
      cy: -5,
    });
    rocket.push({
      x: jet[0].x,
      y: jet[0].y - jetSize / 2,
      cx: 0,
      cy: -5,
    });
    rocket.push({
      x: jet[0].x + jetSize / 4,
      y: jet[0].y - jetSize / 4,
      cx: 0.5,
      cy: -5,
    });

    jet[0].shot = false;

    setTimeout(function () {
      jet[0].shot = true;
    }, 350);
  }
}

function backgroundRun() {
  ctx.drawImage(skybg, 0, positionBg, canvas.width, canvas.height);
  ctx.drawImage(
    skybg,
    0,
    positionBg - canvas.height,
    canvas.width,
    canvas.height
  );

  positionBg += speedBg;

  if (positionBg >= canvas.height) {
    positionBg = 0;
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gameOverCondition() {
  if (jet[0].exist === 1 || monster.length >= 90) {
    isGameOver = true;

    if (getItem(scoreRectangleData.keyLS) <= scoreRectangleData.score) {
      setItem(scoreRectangleData.keyLS, scoreRectangleData.score);
    }
  }
}

function gameOverScreenShow() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.strokeStyle = "red";
  ctx.strokeText("Game Over", canvas.width / 2, canvas.height / 2 - 120);

  ctx.strokeText(
    "Сongratulations, you are dead",
    canvas.width / 2,
    canvas.height / 2 - 60
  );
  ctx.strokeText(
    `Destroy enemies: ${scoreRectangleData.score}`,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.strokeText(
    `Record of destroyed enemies: ${getItem(scoreRectangleData.keyLS)}`,
    canvas.width / 2,
    canvas.height / 2 + 60
  );

  sadSmile(40, canvas.width / 2 - 80, canvas.height / 2 + 100);
  sadSmile(50, canvas.width / 2 - 20, canvas.height / 2 + 90);
  sadSmile(40, canvas.width / 2 + 50, canvas.height / 2 + 100);
}

function sadSmile(size, x, y) {
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + size * 0.35, y + size * 0.35, size * 0.1, 0, Math.PI * 2);
  ctx.arc(x + size * 0.65, y + size * 0.35, size * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + size / 2, y + size * 0.85, size * 0.25, 0, Math.PI, true);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + size * 0.2);
  ctx.lineTo(x + size * 0.5, y);
  ctx.lineTo(x + size * 0.75, y + size * 0.2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function scoreRectangle(data) {
  ctx.fillStyle = data.textColor;
  ctx.font = `${data.textSize} ${data.textFont}`;
  ctx.fillText(
    `${data.text} ${data.score}`,
    canvas.width - data.width,
    data.height
  );
}

function getItem(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (error) {
    console.error("Error in getting data from localStorage", error);
    return null;
  }
}

function setItem(key, data) {
  try {
    return localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error in getting data from localStorage", error);
    return null;
  }
}

let requestAnimationFrameForAll = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();
