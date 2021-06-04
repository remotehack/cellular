import { Rule } from "./Automaton.js";

class RuleManagerElement extends HTMLElement {
  static get observedAttributes() { return ['rule-type']; }
  constructor() {

    // Always call super first in constructor
    super();

    const template = document.getElementById("rule-manager");
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.form = this.shadowRoot.getElementById('rule');

    this.shadowRoot.querySelector("#delete-rule--button").addEventListener("click", e => {
      this.remove();
    })
  }

  attributeChangedCallback() {
    this.updateStyle();
  }

  updateStyle() {
    const context = this.getAttribute("rule-context");
    const type = this.getAttribute("rule-type");
    if (type === "create") {
      Array.from(this.shadowRoot.querySelectorAll(".js--rule-type--create")).forEach(e => e.hidden = false);
      Array.from(this.shadowRoot.querySelectorAll(".js--rule-type--modify")).forEach(e => e.hidden = true);
    } else {
      Array.from(this.shadowRoot.querySelectorAll(".js--rule-type--create")).forEach(e => e.hidden = true);
      Array.from(this.shadowRoot.querySelectorAll(".js--rule-type--modify")).forEach(e => e.hidden = false);
    }
  }

  setRule(rule) {
    this.form.elements["applicable-cells"].value = rule.start;
    this.form.elements["condition"].value = rule.condition;
    this.form.elements["result"].value = rule.result;
  }

  getRule() {
    return new Rule(
      this.form.elements["applicable-cells"].value,
      this.form.elements["condition"].value,
      this.form.elements["result"].value
    )
  }

  clear() {
    this.form.elements["applicable-cells"].value = "";
    this.form.elements["condition"].value = "";
    this.form.elements["result"].value = "";
  }
}

class FormManager {
  constructor(formElement, rulesets) {
    this.formElement = formElement;

    this.formElement.addEventListener('submit', e => {
      e.preventDefault();
      this.onStart({
        gridSize: formElement.elements["grid-size"].value,
        intervalPeriod: formElement.elements["generation-time"].value,
        rules: this.rules,
        initSupplier: formElement.elements["init-supplier"].value
      });
    });

    this.resetNewRule();

    this.formElement.querySelector("#add-rule--button").addEventListener('click', e => {

      const newRuleElement = document.querySelector("#new-rule");

      newRuleElement.setAttribute("rule-type", "modify");
      newRuleElement.setAttribute("rule-context", "simple");

      this.resetNewRule();

      document.querySelector("#rules").appendChild(newRuleElement);
      document.querySelector("#no-rules").hidden = true;
    });

    const rulesetWrapper = this.formElement.querySelector("#example-rulesets");

    for (let ruleset of rulesets) {
      const rulesetButtonWrapper = document.querySelector("#example-ruleset-button").content.cloneNode(true);
      const rulesetButton = rulesetButtonWrapper.querySelector("button");
      rulesetButton.innerHTML = `Load "${ruleset.name}"`;
      rulesetButton.addEventListener('click', e => this.loadRuleset(ruleset));
      rulesetWrapper.appendChild(rulesetButtonWrapper);
    }
  }

  loadRuleset(ruleset) {
    this.resetNewRule();
    this.rules = ruleset.rules;
    this.initSupplier = ruleset.initSupplier;
  }

  resetNewRule() {
    this.formElement.querySelector("#new-rule-wrapper").innerHTML =
      `<rule-manager id="new-rule" rule-type="create" rule-context="simple"></rule-manager>`;
  }

  set rules(rules) {
    const ruleWrapper = this.formElement.querySelector("#rules");
    const clonedParent = ruleWrapper.cloneNode(false);
    ruleWrapper.parentNode.replaceChild(clonedParent, ruleWrapper);

    const rulesWrapperElement = this.formElement.querySelector("#rules");
    for (let rule of rules) {

      const ruleElement = document.createElement("rule-manager");
      ruleElement.setAttribute("rule-type", "modify");
      ruleElement.setAttribute("rule-context", "simple");
      ruleElement.setRule(rule);

      rulesWrapperElement.appendChild(ruleElement)
    }
  }

  set initSupplier(initSupplier) {
    this.formElement.elements["init-supplier"].value = initSupplier;
  }

  get rules() {

    const ruleElements = Array.from(
      this.formElement
        .querySelector("#rules")
        .querySelectorAll("rule-manager")
    );

    return ruleElements.map(r => r.getRule());
  }
}

export function createForm(formElement, rulesets) {
  customElements.define('rule-manager', RuleManagerElement);

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

  return new FormManager(formElement, rulesets);

}
