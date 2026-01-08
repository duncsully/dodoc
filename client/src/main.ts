import { render } from "lit-html";
import "./style.css";
import { html } from "solit-html";

const mount = document.querySelector<HTMLDivElement>("#app")!;
render(App(), mount);

function App() {
  return html`<span>Works!</span>`;
}
