canvas = document.getElementById("life");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
cellWidth = 10;
cellHeight = 10;
nrows = Math.floor(canvas.height / cellHeight);
ncols = Math.floor(canvas.width / cellWidth);


WIDTH = Math.floor(canvas.width / cellWidth);
HEIGHT = Math.floor(canvas.height / cellHeight);

const ctx = canvas.getContext("2d", { alpha: false });
// let ctx = canvas.getContext("2d");

// for (let i = 0; i < WIDTH; +i++) {
//     for (let j = 0; j < HEIGHT; j++) {
//       ctx.fillStyle = `rgb(
//           ${Math.floor(255 - 2 * i)},
//           ${Math.floor(255 - 2 * j)},
//           0)`;
//       ctx.fillRect(j * 25, i * 25, 25, 25);
//     }
//   }

let grid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));
let nextGrid = new Array(HEIGHT).fill(0).map(row => new Array(WIDTH).fill(0).map(cell => Math.random() ));

let render = (matrix) => {
  for (let i = 0; i <= nrows; i++) {
    for(let j = 0; j <= ncols; j++) {
      color = Math.floor(matrix[i][j] * 255);
      ctx.fillStyle = 'rgb('+color+','+color+','+color+')';
      ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
    }
  }
}

// let computeNext = (matrix) => {
  
// }

canvas.addEventListener("click", (e) => {
  console.log(Math.floor(e.offsetX/cellWidth),Math.floor( e.offsetY/cellHeight));
});

console.log(grid);
render(grid);
// console.log(Math.floor(grid[1][1]*255));
