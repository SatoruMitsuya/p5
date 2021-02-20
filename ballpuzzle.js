let dBasket = null;

const selected = -50;
const unselected = 50;
const xSize = 15;
const YSize = 30;
const BALL_CNT = 4;
const COLOR_TYPE = 8;
const BASKET_CNT = 9;

//ボールの生成 ランダムを使って混ぜる作業
function randomBall(_baskets) {
  //色の上限を判定する用の配列を準備
  let checkLimitTypes = [COLOR_TYPE];

  //初期化
  for (let i = 0; i < COLOR_TYPE; i++) {
    checkLimitTypes[i] = BALL_CNT;
  }

  // ボールの生成
  for (let i = 0; i < COLOR_TYPE; i++) {
    let balls = [BALL_CNT];

    for (let j = 0; j < BALL_CNT; j++) {
      let isLoop = true;
      let colorType = 0;

      //色が必ず定数はいるようにループで回す
      while (isLoop) {
        colorType = Math.floor(random(1, COLOR_TYPE + 1));
        // console.log(
        //   colorType,
        //   checkLimitTypes[0],
        //   checkLimitTypes[1],
        //   checkLimitTypes[2],
        //   checkLimitTypes[3]
        // );

        if (checkLimitTypes[colorType - 1] > 0) {
          checkLimitTypes[colorType - 1]--;
          isLoop = false;
        }
        // isLoop = false;
      }

      balls[j] = new ball(
        80 * i + 40,
        _baskets.allBaskets[i].yInitBallPoint() - xSize * 2 * j,
        xSize,
        colorType
      );
    }
    _baskets.allBaskets[i].balls = balls;
    _baskets.allBaskets[i].count = balls.length;
  }
}

//ボールの色を指定する
function getColor(c) {
  const cWhite = color("white");

  switch (c) {
    case 1:
      return color("orangered");
    case 2:
      return color("cornflowerblue");
    case 3:
      return color("forestgreen");
    case 4:
      return color("moccasin");
    case 5:
      return color("brown");
    case 6:
      return color("mediumblue");
    case 7:
      return color("yellowgreen");
    case 8:
      return color("tan");

    default:
      return cWhite;
  }
}

class ball {
  constructor(_x, _y, _r, _type) {
    this.x = _x;
    this.y = _y;
    this.r = _r;
    this.type = _type;

    // this.selected = false;
  }

  show() {
    // noStroke();
    // noFill();
    fill(getColor(this.type));
    circle(this.x, this.y, this.r * 2);
  }

  changePoint(_pointX, _pointY) {
    this.x = _pointX;
    this.y = _pointY;
  }
}

class basket {
  constructor(_x, _y, _xBoxSize, _yBoxSize) {
    this.x = _x;
    this.y = _y;
    this.xBoxSize = _xBoxSize;
    this.yBoxSize = _yBoxSize;
    this.count = 0;

    this.balls = [BALL_CNT];
    this.selected = false;

    this.#init();
  }

  #init() {
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i] = null;
    }
  }
  yInitBallPoint() {
    return this.y + this.yBoxSize - xSize;
  }

  show() {
    //バスケットの表示
    rectMode(RADIUS);
    fill("white");
    rect(this.x, this.y, this.xBoxSize, this.yBoxSize);

    //ボールの表示
    if (this.balls !== null) {
      for (const dBall of this.balls) {
        if (dBall !== null) {
          dBall.show();
        }
      }
    }
  }

  contains(_x, _y) {
    return (
      _x > this.x - this.xBoxSize &&
      _x < this.x + this.xBoxSize &&
      _y > this.y - this.yBoxSize &&
      _y < this.y + this.yBoxSize
    );
  }

  outBall() {
    if (this.count > 0) {
      if (this.balls !== null) {
        let selectedBall = this.balls[this.count - 1];
        this.balls[this.count - 1] = null;

        this.count--;
        return selectedBall;
      }
    }
    return null;
  }

  inBall(_ball) {
    if (this.count < 4) {
      if (_ball !== null) {
        this.count++;

        this.balls[this.count - 1] = _ball;
        this.undo();
        return true;
      }
    }
    return false;
  }

  //バスケットのボールを選択する
  select() {
    if (this.count > 0) {
      if (this.balls !== null) {
        if (this.balls[this.count - 1] !== null) {
          this.balls[this.count - 1].changePoint(this.x, 50);
          this.selected = true;
        }
      }
    }
  }

  undo() {
    if (this.count > 0) {
      if (this.balls !== null) {
        if (this.balls[this.count - 1] !== null) {
          this.balls[this.count - 1].changePoint(
            this.x,
            this.yInitBallPoint() - xSize * 2 * (this.count - 1)
          );
          this.selected = false;
        }
      }
    }
  }
}

class baskets {
  constructor(_count) {
    this.count = _count;
    this.allBaskets = [_count];

    this.#init(_count);

    this.selected = null;
  }

  #init(_count) {
    for (let i = 0; i < _count; i++) {
      this.allBaskets[i] = new basket(
        80 * i + 40,
        190,
        xSize + 4,
        xSize * BALL_CNT + 10
      );
    }
  }

  show() {
    for (const basket of this.allBaskets) {
      basket.show();
    }
  }

  select() {
    for (const basket of this.allBaskets) {
      if (basket.contains(mouseX, mouseY)) {
        //箱をクリックした場合

        if (this.selected !== null) {
          //すでに他のボールを選んでいるときは選択しているボールを移動させる

          const ball = this.selected.outBall();
          if (basket.inBall(ball) === false) {
            this.selected.inBall(ball);
          }
          this.selected = null;
          return this.selected;
        } else {
          // まだボールを選んでないときは選択した箱からボールを一つ出す

          this.selected = basket;
          this.selected.select();
          if (this.selected.selected === false) {
            this.selected = null;
          }
          return this.selected;
        }
      }
    }
    if (this.selected !== null) {
      //箱を選んでないがすでにボールがあるなら元の場所に戻す。
      this.selected.undo();
      this.selected = null;
    }
    return this.selected;
  }
}

function setup() {
  createCanvas(800, 400);
  //初期化
  dBasket = new baskets(BASKET_CNT);
  randomBall(dBasket);

  //バスケットの描画
  background(220);
  dBasket.show();
}

// function draw() {
//   background(220);
//   //バスケットの描画
//   dBasket.show();
// }

// マウスクリック時のコールバック
function mousePressed() {
  //バスケットの選択
  dBasket.select();

  //バスケットの描画
  background(220);
  dBasket.show();
  return false;
}
