const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const jetSize = 50;
const monsterSize = 100;
const rocketSize = 10;

const currentFramesFire = [3, 0, 3];
const jetFirePositions = [
  { x: 2, y: jetSize / 2 - 3 },
  { x: -5, y: jetSize / 2 },
  { x: -12, y: jetSize / 2 - 3 },
];

let speedBg = 1;
let position = 0;
let timer = 0;
let jet = [
  {
    x: (canvas.width - jetSize) / 2,
    y: canvas.height - jetSize,
    cx: 0,
    cy: 0,
  },
];
let monster = [
  // {
  //   x: canvas.width / 2,
  //   y: monsterSize / 2,
  //   cx: 1,
  //   cy: 1,
  //   exist: 0,
  // },
];
let rocket = [];

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

canvas.addEventListener("mousemove", (event) => {
  jet[0].x = event.offsetX - 25;
  jet[0].y = event.offsetY - 25;
});

skybg.onload = () => {
  console.log("bg", canvas.width);

  game();
};

function game() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  render();

  requestAnimationFrameForAll(game);
}

function update() {
  timer++;
  // jetFire();
  if (timer % 30 === 0) {
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
  }

  if (timer % 10 === 0) {
    monster.push({
      x: random(0 + monsterSize / 4, canvas.width - monsterSize / 4),
      y: 0 + monsterSize / 4,
      cx: random(-1, 1),
      cy: random(2, 10),
      burst: false,
      exist: 0,
    });
  }

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

    // jakszczo wylitaje za nyz ekranu
    // if (monster[i].y > canvas.height) {
    //   monster.splice(i, 1);
    // }

    collision(monster[i], rocket, rocketSize);
    // for (let j = 0; j < rocket.length; j++) {
    //   let rocketCircle = rocket[j];
    //   let dx = rocketCircle.x - monster[i].x;
    //   let dy = rocketCircle.y - monster[i].y;
    //   let distance = Math.hypot(dx, dy);

    //   if (distance <= monsterSize / 4 + rocketSize / 2) {
    //     monster[i].exist = 1;
    //     rocket.splice(j, 1);
    //     break;
    //   }
    // }
    if (monster[i].exist == 1) {
      monster.splice(i, 1);
    }
  }

  if (monster.length >= 50) {
    monster = [];
  }
}

function render() {
  backgroundRun();

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
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();
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
    ctx.beginPath();
    ctx.arc(monster[i].x, monster[i].y, monsterSize / 3.5, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();
  }
}

function collision(monsterIndex, objectCollision, objectCollisionSize) {
  for (let i = 0; i < objectCollision.length; i++) {
    let objectCollisionCircle = objectCollision[i];
    let dx = objectCollisionCircle.x - monsterIndex.x;
    let dy = objectCollisionCircle.y - monsterIndex.y;
    let distance = Math.hypot(dx, dy);

    if (distance <= monsterSize / 4 + objectCollisionSize / 2) {
      monsterIndex.exist = 1;
      objectCollision.splice(i, 1);
      break;
    }
  }
}

function jetFire() {
  jetFirePositions.map((jetFirePosition, index) => {
    currentFramesFire[index]++;
    FireShow(
      currentFramesFire[index],
      jet[0].x + jetFirePosition.x,
      jet[0].y + jetFirePosition.y
    );
    if (currentFramesFire[index] >= 6) {
      currentFramesFire[index] = 0;
    }
  });
}

function FireShow(currentFrame, cx, cy) {
  ctx.drawImage(flammeImg, 16 * currentFrame, 0, 16, 48, cx, cy, 10, 25);
}

function jetShow() {
  ctx.drawImage(
    jetImg,
    jet[0].x - jetSize / 2,
    jet[0].y - jetSize / 2,
    jetSize,
    jetSize
  );
  ctx.beginPath();
  ctx.arc(jet[0].x, jet[0].y, jetSize / 2, 0, 2 * Math.PI);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.stroke();
}

function backgroundRun() {
  ctx.drawImage(skybg, 0, position, canvas.width, canvas.height);
  ctx.drawImage(
    skybg,
    0,
    position - canvas.height,
    canvas.width,
    canvas.height
  );

  position += speedBg;

  if (position >= canvas.height) {
    position = 0;
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

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
