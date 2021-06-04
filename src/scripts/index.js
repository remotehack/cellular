import Canvas from "./Canvas.js"
import Grid from "./Grid.js"
import { Automaton } from "./Automaton.js"
import { createForm } from "./FormManager.js"

let activeInterval = undefined;

const canvas = new Canvas();

function startNewAutomaton({
  gridSize,
  intervalPeriod,
  rules,
  initSupplier
}) {
  if (activeInterval !== undefined) {
    clearInterval(activeInterval);
    activeInterval = undefined;
  }

  const grid = new Grid(canvas.width, canvas.height, {spacing: 1.0 - gridSize});

  const automaton = new Automaton(grid, rules, initSupplier);
  automaton.createInitialGeneration();
  activeInterval = setInterval(loop, intervalPeriod);

  function loop() {
    automaton.runNextGeneration();

    requestAnimationFrame(() => {
      canvas.clear("white");
      canvas.ctx.fillStyle = "black";
      grid.forEach(el => {
        canvas.ctx.beginPath();
        canvas.ctx.font = `${grid.cw}px sans-serif`;
        canvas.ctx.fillText(el.state, el.x, el.y);
        canvas.ctx.fill();
        canvas.ctx.closePath();
      })
    })
  }
}

window.addEventListener("load", e => {
  const form = createForm(document.querySelector("#controls"));
  form.onStart = startNewAutomaton;
});

