const WIDTH = 20;
const HEIGTH = 20;

const CELL_WIDTH = 20;
const CELL_HEIGTH = 20;

const CONNECTIONS = 3;

let images = null;
let grid = null;
let a = null;
const connections = {
  "bar": [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "blank":  [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "i": [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "s": [
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
  ],
  "s_r": [
    [0, 0, 0],
    [0, 0, 1],
    [0, 0, 0],
    [0, 0, 1],
  ],
  "t": [
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "l": [
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "long_l": [
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
    [1, 0, 0],
  ],
  "short_l": [
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 1],
  ],
  "long_l_r": [
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "short_l_r": [
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "two_ends_1": [
    [0, 0, 0],
    [0, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "two_ends_2": [
    [0, 0, 0],
    [1, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "three_ends": [
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "w": [
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  "w_and_bar": [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 0],
    [1, 0, 0],
  ],
  "w_bar": [
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  "w_bar_r": [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
};

const closestPowerOfTwo = n => Math.pow(2, Math.ceil(Math.log2(n)));
const sleep = ms => new Promise(r => setTimeout(r, ms));

class Cell {
  constructor(img, dir) {
    this.img = img;
    this.dir = dir;
  }

  getConnections() {
    const c = [];
    for (let i = this.dir; i <= 3; ++i) c.push(connections[this.img][i]);
    for (let i = 0; i < this.dir; ++i) c.push(connections[this.img][i]);
    return c;
  }
};

class Options {
  constructor(options) {
    this.options = options;
    this.updated = false;
  }
}

class Grid {
  constructor(w, h) {
    this.width = w;
    this.heigth = h;

    this.cells = new Array(WIDTH)
      .fill(0)
      .map(() => new Array(HEIGTH)
        .fill(0)
        .map(() => {
          let options = [];

          const nbOptions = Object.keys(images).length * 4;
          for (let i = 0; i < nbOptions; ++i) {
            const imageIndex = Math.floor(i / 4);
            const direction = i % 4;
            options.push(new Cell(Object.keys(images)[imageIndex], direction));
          }

          return new Options(options);
        })
      );
  }

  getCellsWithLeastOptions() {
    let options = [];
    let minOptions = null;

    for (let x = 0; x < this.width; ++x) {
      for (let y = 0; y < this.heigth; ++y) {
        const optionsCount = this.cells[x][y].options.length;
        if (optionsCount > 1 && (minOptions === null || optionsCount < minOptions)) {
          minOptions = optionsCount;
          options = [{ x, y }];
        } else if (optionsCount === minOptions) {
          options.push({ x, y });
        }
      }
    }

    return options;
  }
  
  updateAdjacentCells(x, y, except = null) {
    // UP
    if (except != 0 && y - 1 >= 0 && this.cells[x][y - 1].updated === false) {
      this.updateCellOptionsFrom({ x, y: y - 1 }, { x, y }, 0);
    }
    
    // RIGHT
    if (except != 1 && x + 1 <= this.width - 1 && this.cells[x + 1][y].updated === false) {
      this.updateCellOptionsFrom({ x: x + 1, y }, { x, y }, 1);
    }

    // DOWN
    if (except != 2 && y + 1 <= this.heigth - 1 && this.cells[x][y + 1].updated === false) {
      this.updateCellOptionsFrom({ x, y: y + 1 }, { x, y }, 2);
    }
    
    // LEFT
    if (except != 3 && x - 1 >= 0 && this.cells[x - 1][y].updated === false) {
      this.updateCellOptionsFrom({ x: x - 1, y }, { x, y }, 3);
    }
  }

  selectOptionForCell({ x, y }, optionsId = null) {
    // If no option is explicitly provided, select one randomly
    if (optionsId === null) {
      optionsId = Math.floor(Math.random() * this.cells[x][y].options.length);
    }

    // Update the cell with the selected option
    this.cells[x][y].options = [this.cells[x][y].options[optionsId]];
    this.cells[x][y].updated = true;

    // Update the adjacent cells
    this.updateAdjacentCells(x, y);
  }

  // This method up... to finish
  updateCellOptionsFrom(to, from, dir) {
    const fromConnections = this.cells[from.x][from.y].options.map(option => option.getConnections()[dir]);
    const oppositeDir = (dir + 2) % 4;
    const length = this.cells[to.x][to.y].options.length;

    this.cells[to.x][to.y].options = this.cells[to.x][to.y].options.filter((cell) => {
      const toConnection = cell.getConnections()[oppositeDir];

      return fromConnections.some((connection) => {
        for (let i = 0; i < CONNECTIONS; ++i) {
          if (toConnection[i] != connection[CONNECTIONS - 1 - i]) {
            return false;
          }
        }
        return true;
      });
    });

    if (this.cells[to.x][to.y].options.length != length) {
      this.updateAdjacentCells(to.x, to.y, oppositeDir);
    }
  }

  completed() {
    return this.cells.every((row) => row.every((cell) => cell.options.length === 1));
  }

  resetOptionsUpdatedField() {
    this.cells.forEach((row) => row.forEach((cell) => cell.updated = false));
  }
};

function preload() {
  images = {
    "bar": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/bar.png"),
    "blank": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/blank.png"),
    "i": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/i.png"),
    "s": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/s.png"),
    "s_r": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/s_r.png"),
    "t": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/t.png"),
    "l": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/l.png"),
    // "long_l": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/long_l.png"),
    // "short_l": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/short_l.png"),
    // "long_l_r": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/long_l_r.png"),
    // "short_l_r": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/short_l_r.png"),
    // "two_ends_1": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/two_ends_1.png"),
    // "two_ends_2": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/two_ends_2.png"),
    // "three_ends": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/three_ends.png"),
    // "w": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/w.png"),
    // "w_and_bar": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/w_and_bar.png"),
    // "w_bar": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/w_bar.png"),
    // "w_bar_r": loadImage("https://raw.githubusercontent.com/MonsieurPinta/images/master/w_bar_r.png"),
  };
}

function setup() {
  createCanvas(WIDTH * CELL_WIDTH, HEIGTH * CELL_HEIGTH);
  imageMode(CENTER);
  angleMode(DEGREES);
  background(200);
  frameRate(120);
  grid = new Grid(WIDTH, HEIGTH);
};

function drawCell(x, y, w, h, cell) {
  translate(x * CELL_WIDTH + CELL_WIDTH / 2, y * CELL_HEIGTH + CELL_HEIGTH / 2);
  rotate(-cell.dir * 90);
  image(images[cell.img], 0, 0, w, h);
}

function drawCells(x, y, cells) {
  if (cells.options.length === 1) {
    drawCell(x, y, CELL_WIDTH, CELL_HEIGTH, cells.options[0]);
  }
  // else {

  //   for (let i = 0; i < cells.length; i++) {
  //     drawCell(x * CELL_WIDTH, y * CELL_HEIGTH, CELL_WIDTH, CELL_HEIGTH, cells[i].img);
  //   }
  // }
}

function toto() {
  const cells = grid.getCellsWithLeastOptions();
  const randomCellIndex = Math.floor(Math.random() * cells.length);
  const cell = cells[randomCellIndex];
  grid.selectOptionForCell(cell);
  drawCells(cell.x, cell.y, grid.cells[cell.x][cell.y])
  grid.resetOptionsUpdatedField();
  // drawGrid(grid);
}

function drawGrid(grid) {
  for (let x = 0; x < grid.width; x++) {
    for (let y = 0; y < grid.heigth; y++) {
      drawCells(x, y, grid.cells[x][y]);
    }
  }
}

function draw() {
  if (!grid.completed()) {
    toto();
  }
  // noLoop();
}

function mousePressed() {
  loop();
}