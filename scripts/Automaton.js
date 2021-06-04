export class Rule {
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
    const test = Math.random();

    return test < p ? true : false;
  }

  get status() {
    return grid.get(`${xi},${yi}`).state
  }
}

export class Automaton {
  constructor(grid, rules, initSupplier) {
    this.rules = rules;
    this.initSupplier = new Function(`return ${initSupplier}`);
    this.grid = grid;
    this.generationCount = 0;
  }

  createInitialGeneration() {
    for (let xi = 0; xi < this.grid.xCount; xi++) {
      for (let yi = 0; yi < this.grid.yCount; yi++) {
        const processor = new CellProcessor(this.grid, [xi, yi]);
        this.grid.get(`${xi},${yi}`).state = this.initSupplier.bind(processor)();
      }
    }
  }

  runNextGeneration() {
    console.log(`Generation ${this.generationCount++}`);

    const nextGrid = [];

    for (let xi = 0; xi < this.grid.xCount; xi++) {
      for (let yi = 0; yi < this.grid.yCount; yi++) {
        const next = this.test([xi, yi]);
        nextGrid.push({
          xi, yi, state: next
        });
      }
    }

    for (let {xi, yi, state} of nextGrid) {
      this.grid.get(`${xi},${yi}`).state = state;
    }
  }

  test([xi, yi]) {
    const processor = new CellProcessor(this.grid, [xi, yi]);
    for (let rule of this.rules) {
      if (rule.start === this.grid.get(`${xi},${yi}`).state) {
        const predicateResult = rule.predicate.bind(processor)(this.grid, [xi, yi]);
        if (predicateResult) {
          return rule.result;
        }
      }
    }
    return this.grid.get(`${xi},${yi}`).state;
  }
}