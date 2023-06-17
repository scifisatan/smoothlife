canvas = document.getElementById("life");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

cellWidth = 5;
cellHeight = 5;

WIDTH = Math.floor(canvas.width / cellWidth);
HEIGHT = Math.floor(canvas.height / cellHeight);

const ctx = canvas.getContext("2d", { alpha: false });



let val = {
  "b1": 0.278,
  "b2": 0.365,
  "d1": 0.167,
  "d2": 0.445,
  "dt": 0.5,
  "alphaM": 0.147,
  "alphaN": 0.028,
  "innerRadius": 7,
  "outerRadius": 15
}

let grid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0));
let nextGrid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0));

for (let i = 0; i < 120/2; i++) {
    for (let j = 0; j <= 120/2; j++) {
        grid[i][j] = Math.random();
    }
  }


let render = (matrix) => {
  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j <= WIDTH; j++) {
      color = Math.floor(matrix[i][j] * 255);
      ctx.fillStyle = 'rgb(' + color + ',' + color + ',' + color + ')';
      ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  }
}

const emod = (x, y) => {
  return (x % y + y) % y;
}

const sigma = (x, a, alpha) => {
  return 1 / (1 + Math.exp(-(x - a) * 4 / alpha));
}

const sigmaN = (x, a, b) => {
  return sigma(x, a, val["alphaN"]) * (1 - sigma(x, b, val["alphaN"]));
}

const sigmaM = (x, y, m) => {
  return x * (1 - sigma(m, 0.5, val["alphaM"])) + y * sigma(m, 0.5, val["alphaM"]);
}

const state = (n, m) => {
  return sigmaN(
    n,
    sigmaM(
      val["b1"],
      val["d1"],
      m),
    sigmaM(
      val["b2"],
      val["d2"],
      m
    )
  );
}


const update = () => {
  for (let cx = 0; cx < WIDTH; cx++) {
    for (let cy = 0; cy < HEIGHT; cy++) {
      let m = n = M = N = 0;
      ra = val["outerRadius"];
      ri = ra / 3.0;
      m = n = M = N = 0;
      for (let dy = -(ra - 1); dy <= (ra - 1); ++dy) {
        for (let dx = -(ra - 1); dx <= (ra - 1); ++dx) {
          x = emod(cx + dx, WIDTH);
          y = emod(cy + dy, HEIGHT);

          if (dx * dx + dy * dy <= ri * ri) {
            m += grid[y][x];
            M++;
          }
          else if (dx * dx + dy * dy <= ra * ra) {
            n += grid[y][x];
            N++;
          }

        }


      }
      m /= M;
      n /= N;
      nextGrid[cy][cx] = 2 * state(n, m) - 1;
    }

  }
}

const clamp = (x, min, max) => {
  return x < min ? min : x > max ? max : x;
}

const apply = () => {
  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j <= WIDTH; j++) {
      grid[i][j] += val["dt"] * nextGrid[i][j];
      grid[i][j] = clamp(grid[i][j], 0, 1);

    }
  }
}




setInterval(() => {

  update(grid, nextGrid);
  apply(grid, nextGrid);
  render(grid);


}
  , 1000 / 240);


//play pause and reset button use
// let play = document.getElementById("play");
// let pause = document.getElementById("pause");
// let reset = document.getElementById("reset");

// play.addEventListener("click", () => {
//   setInterval(() => {
//     update(grid,nextGrid);
//     [grid, nextGrid] = [nextGrid, grid];
//     render(grid);
//   }
//   , 2000);
// }
// );

// pause.addEventListener("click", () => {
//   clearInterval();
// }
// );

// reset.addEventListener("click", () => {
//   grid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));
//   nextGrid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));
//   render(grid);
// }
// );



















