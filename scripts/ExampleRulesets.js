import { Rule } from "./Automaton.js";

export const rulesets = [
  {
    name: "Conway's Game of Life",
    id: "conways-game-of-life",
    rules: [
      new Rule("🧞‍♀️", `this.countNeighbours("🧞‍♀️") < 2`, " "),
      new Rule("🧞‍♀️", `this.countNeighbours("🧞‍♀️") > 3`, " "),
      new Rule(" ", `this.countNeighbours("🧞‍♀️") === 3`, "🧞‍♀️")
    ],
    initSupplier: `this.chance(0.3) ? "🧞‍♀️" : " "`
  },
  {
    name: "Forest-fire model",
    id: "forest-fire-model",
    rules: [
      new Rule("🔥", `true`, " "),
      new Rule("🌳", `this.countNeighbours("🔥") > 0`, "🔥"),
      new Rule("🌳", `this.chance(0.02)`, "🔥"),
      new Rule(" ", `this.chance(0.04)`, "🌳")
    ],
    initSupplier: `' '`
  }
]