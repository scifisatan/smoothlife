// import {state} from './blackbox.js';

canvas = document.getElementById("life");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

cellWidth = 10;
cellHeight = 10;

WIDTH = Math.floor(canvas.width / cellWidth);
HEIGHT = Math.floor(canvas.height / cellHeight);

const ctx = canvas.getContext("2d", { alpha: false });

let grid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));
let nextGrid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));

let val = {
  "b1": 0.278,
  "b2": 0.365,
  "d1": 0.267,
  "d2": 0.445,
  "alpha": 1,
  "innerRadius":2,
  "outerRadius": 4,
}

let render = (matrix) => {
  for (let i = 0; i < HEIGHT; i++) {
    for(let j = 0; j <= WIDTH; j++) {
      color = Math.floor(matrix[i][j] * 255);
      ctx.fillStyle = 'rgb('+color+','+color+','+color+')';
      ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  }
}

const sigma1 = (x, a) => {
  return 1 / (1 + Math.exp(-(x - a) * 4 /val["alpha"]));
}

const sigma2 = (x, a, b) => {
  return sigma1(x, a) * (1 - sigma1(x, b));
}

const sigmaM = (x, y, m) => {
  return x * (1 - sigma1(m, 0.5)) + y * sigma1(m, 0.5);
}

const state = (n, m) => {
  return sigma2(
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

function calculateMean(array, centerX, centerY, radius) {
  let sum = 0;
  let count = 0;
  let mean = 0;

  const arrayWidth = array.length;
  const arrayHeight = array[0].length;

  for (let i = centerX - radius; i <= centerX + radius; i++) {
    for (let j = centerY - radius; j <= centerY + radius; j++) {
  
      
      if (i >= 0 && i < arrayWidth && j >= 0 && j < arrayHeight) {
        sum += array[i][j];
        count++;
      }
    }
  }

  mean = sum / count;
  return mean;
}




const update = (grid,nextGrid) => {
 
  for (let i = 0; i < HEIGHT; i++) {
    for(let j = 0; j <= WIDTH; j++) {
      n = calculateMean(grid, i, j, 21);
      m = calculateMean(grid, i, j, 7);

      n = n - m;
      // console.log(n,m)
      console.log(state(n, m))
      // n = a-m;
      nextGrid[i][j] = state(n, m);
      // nextGrid[i][j] = 1-grid[i][j];
    }
  }
}

// render(grid);

canvas.addEventListener("click", (e) => {
  update(grid,nextGrid);
  [grid, nextGrid] = [nextGrid, grid];
  render(grid);
});



