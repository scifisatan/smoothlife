canvas = document.getElementById("life");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

cellWidth = 5;
cellHeight = 5;

WIDTH = Math.floor(canvas.width / cellWidth);
HEIGHT = Math.floor(canvas.height / cellHeight);

const ctx = canvas.getContext("2d", { alpha: false });

let grid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));
let nextGrid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));

let val = {
  "b1": 0.002,
  "b2": 0.9,
  "d1": 0.45,
  "d2": 0.87,
  "alpha": 0.178,
  "innerRadius":2,
  "outerRadius":12,
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

const emod = (x, y) => {
  return (x%y + y)%y;
}

const calculateMean = (array, centerX, centerY, radius) => {
  ri = radius/3;
  m = n = M = N = 0;
  for (let i = -(radius-1); i <= (radius - 1); ++i) {
  for (let j = -(radius-1) ; j <= (radius-1); ++j) {
      if (i >= 0 && i < array.length && j >= 0 && j < array[0].length) {
          x = emod(j + centerX , WIDTH);
          y = emod(i + centerY , HEIGHT);

          if(i*i + j*j <= ri*ri) {
            m += array[y][x];
            M++;
          }
          else if(i*i + j*j <= radius*radius) {
            n += array[y][x];
            N++;
          }

          }


      }
    }

    return [n/N, m/M] ;
  }




const update = (grid,nextGrid) => {
  res = new Array(2);
  m = n = 0;
  for (let i = 0; i < HEIGHT; i++) {
    for(let j = 0; j <= WIDTH; j++) {
      res = calculateMean(grid, i, j, val["outerRadius"]);
  

      n = res[0];
      m = res[1];
 
      nextGrid[i][j] = state(n, m);
     
    }
  }
}


canvas.addEventListener("click", (e) => {
  update(grid,nextGrid);
  [grid, nextGrid] = [nextGrid, grid];
  render(grid);
});

setInterval(() => {
  update(grid,nextGrid);
  [grid, nextGrid] = [nextGrid, grid];
  render(grid);
}
, 1000/2);








      
  

    











