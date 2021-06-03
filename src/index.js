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
    this.predicate = new Function(`return ${condition}`);
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

class CellProcessor {

  constructor(grid, [xi, yi]) {
    this.grid = grid;
    this.xi = xi;
    this.yi = yi;
  }

  countNeighbours(neighbourType) {
    const grid = this.grid;
    const xi = this.xi;
    const yi = this.yi;

    if (this.cachedCounts === undefined) {
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

      this.cachedCounts = new NeighbourCounts(neighbourCounts);
    }
    return this.cachedCounts.get(neighbourType);
  }

  chance(p) {
    return chance(p);
  }
}

// I don't know whether we need this - but possibly a 0, 1, 2 style switcher, where the emojis are configurable - at the moment I've just replaced the a is alive and d is dead with emojis
const emojiStates = {
  alive: "🧞‍♀️",
  dead: "🧟‍♀️"
}

const rules = [
  // if <2 neighbours then die
  new Rule(
    emojiStates.alive,
    `this.countNeighbours("🧞‍♀️") < 2`,
    "🧟‍♀️"
  ),
  // if 2-3 neighbours then die
  new Rule(
    "🧞‍♀️",
    `this.countNeighbours("🧞‍♀️") > 3`,
    "🧟‍♀️"
  ),
  // if 3 neighbours then come alive
  new Rule(
    "🧟‍♀️",
    `this.countNeighbours("🧞‍♀️") === 3`,
    "🧞‍♀️"
  )
];


/**
 * THIS IS JUST TO GET SOME ALIVE ON FIRST LOAD
 * @param {float} chance
 * @description where chance is 0 -> 1 0 being no chance, 1 being yes - returns true or false
 * @returns {Boolean}
 */
function chance(chance) {
  const test = Math.random();

  return test < chance ? true : false;
}

function initialiseGrid(grid) {
  for (let xi = 0; xi < grid.xCount; xi++) {
    for (let yi = 0; yi < grid.yCount; yi++) {

      if (chance(0.3)) {
        grid.get(`${xi},${yi}`).state = "🧞‍♀️";
      } else {
        grid.get(`${xi},${yi}`).state = "🧟‍♀️";
      }
    }
  }
}

function test(grid, [xi, yi], rules) {
  const processor = new CellProcessor(grid, [xi, yi]);
  for (let rule of rules) {
    const predicateResult = rule.predicate.bind(processor)(grid, [xi, yi]);
    if (predicateResult) {
      return rule.result;
    }
  }
  return grid.get(`${xi},${yi}`).state;
}

initialiseGrid(grid);
setInterval(step, 1000)

let generationCount = 0;

function step() {
  console.log(`Generation ${generationCount++}`)
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
      canvas.ctx.font = `${grid.cw}px sans-serif`;
      canvas.ctx.fillText(el.state, el.x, el.y);
      canvas.ctx.fill();
      canvas.ctx.closePath();
    })
  })
}


