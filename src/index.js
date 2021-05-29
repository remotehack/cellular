import Canvas from "./Canvas.js"
import Grid from "./Grid.js"

const canvas = new Canvas();
const grid = new Grid(canvas.width, canvas.height);

class Rule {
  constructor(
    start /* ref to start */,
    condition,
    result /* ref to result */
  ) {
    this.start = start;
    this.condition = condition;
    this.result = result;
  }
}

class NeighbourCounts {
  constructor(counts) {
    this.counts = counts;
  }

  get(s) {
    if (this.counts[s] === undefined) {
      return 0;
    }
    return this.counts[s];
  }

}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function countNeighbours(grid, [xi, yi]) {
  const neighbourCounts = {};
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (!(dx === 0 && dy === 0)) {
        const xim = mod((xi + dx), grid.xCount);
        const yim = mod((yi + dy), grid.yCount);
        const neighbourState =  grid.get(`${xim},${yim}`).state;
        if (neighbourCounts[neighbourState] === undefined) {
          neighbourCounts[neighbourState] = 0;
        }
        neighbourCounts[neighbourState]++;
      }
    }
  }
  return new NeighbourCounts(neighbourCounts);
}

const rules = [
  // if <2 neighbours then die
  new Rule(
    "a",
    (grid, coords) => countNeighbours(grid, coords).get("a") < 2,
    "d"
  ),
  // if 2-3 neighbours then die
  new Rule(
    "a",
    (grid, coords) => countNeighbours(grid, coords).get("a") > 3,
    "d"
  ),
  // if 3 neighbours then come alive
  new Rule(
    "d",
    (grid, coords) => countNeighbours(grid, coords).get("a") === 3,
    "a"
  )
];


function initialiseGrid(grid) {
  for (let xi = 0; xi < grid.xCount; xi++) {
    for (let yi = 0; yi < grid.yCount; yi++) {
      grid.get(`${xi},${yi}`).state = "d";
    }
  }
  grid.get(`2,1`).state = "a";
  grid.get(`2,2`).state = "a";
  grid.get(`2,3`).state = "a";
}

function test(grid, [xi, yi], rules) {
  for (let rule of rules) {
    if (rule.condition(grid, [xi, yi])) {
      return rule.result;
    }
  }
  return grid.get(`${xi},${yi}`).state;
}

initialiseGrid(grid);
setInterval(step, 1000)

function step() {
  const nextGrid = [];
  for (let xi = 0; xi < grid.xCount; xi++) {
    for (let yi = 0; yi < grid.yCount; yi++) {
      const next = test(grid, [xi, yi], rules);
      nextGrid.push({
        xi, yi, state: next
      });
    }
  }
  for (let {xi, yi, state} of nextGrid) {
    grid.get(`${xi},${yi}`).state = state;
  }

  requestAnimationFrame(() => {
    canvas.clear("white");
    canvas.ctx.fillStyle = "black";
    grid.forEach(el => {
      canvas.ctx.beginPath();
      // canvas.ctx.arc(el.x, el.y, 10, 0, 5);
      canvas.ctx.font = '48px sans-serif';
      canvas.ctx.fillText(el.state, el.x, el.y);
      canvas.ctx.fill();
      canvas.ctx.closePath();
    })
  })
}


