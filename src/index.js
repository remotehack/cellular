import Canvas from "./Canvas.js"
import Grid from "./Grid.js"
import { Automaton, Rule } from "./Automaton.js"

const canvas = new Canvas();
const grid = new Grid(canvas.width, canvas.height);

const rules = [
  // if <2 neighbours then die
  new Rule(
    "🧞‍♀️",
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

const initSupplier = `this.chance(0.3) ? "🧞‍♀️" : "🧟‍♀️"`;

const automaton = new Automaton(grid, rules, initSupplier);
automaton.initialiseGrid();
setInterval(loop, 1000);

function loop() {
  automaton.step();

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


