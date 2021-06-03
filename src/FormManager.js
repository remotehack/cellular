import { Rule } from "./Automaton.js";

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


class RuleManager extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    const template = document.getElementById("rule-manager");
    this.attachShadow({mode:"open"})
    this.shadowRoot.append(template.content.cloneNode(true));

    if (this.getAttribute("rule-type") === "create") {
      this.shadowRoot.getElementById("delete-rule--button").hidden = true;
    }
  }
}

class FormManager {
  constructor(formElement) {
    this.formElement = formElement;
    this.formElement.addEventListener('submit', e => {
      e.preventDefault();
      this.onStart({
        gridSize: 0.5,
        intervalPeriod: 1000,
        rules,
        initSupplier
      });
    });
  }
}

export function createForm(formElement) {
  customElements.define('rule-manager', RuleManager);

  for (let output of Array.from(document.querySelectorAll('.js-value-output'))) {
    const associatedInputId = output.dataset.attachToInput;
    if (associatedInputId !== undefined) {
      const associatedInput = document.getElementById(associatedInputId);
      if (associatedInput !== undefined) {
        const updateOutput = () => {
          output.innerHTML = associatedInput.value;
        }
        associatedInput.addEventListener('input', updateOutput);
        updateOutput();
      }
    }
  }

  return new FormManager(formElement);

}
