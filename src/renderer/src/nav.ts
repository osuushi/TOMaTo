import { renderSearch } from "./search";
import { initSettings } from "./settings";
import { renderChat } from "./chat";
import { View } from "../../shared/views";
import { renderCalculator } from "./calculator";

let lastView = View.Search;

// Mappings of views to activate functions
export const VIEW_ACTIVATORS = {
  [View.Search]: activateSearch,
  [View.Chat]: activateChat,
  [View.Calculator]: activateCalculator,
  [View.Settings]: activateSettings,
};

export function currentView(): View {
  return lastView;
}

export function setupNav() {
  // Let's refactor the above. We can just use the keys of VIEW_ACTIVATORS
  Object.keys(VIEW_ACTIVATORS).forEach((viewName: string) => {
    document
      .querySelector(`#nav-${viewName}`)!
      .addEventListener("click", () => {
        VIEW_ACTIVATORS[viewName]();
      });
  });
}

export function activateSearch() {
  setActive(View.Search);
  renderSearch();
}

export function activateChat() {
  setActive(View.Chat);
  renderChat();
}

export function activateCalculator() {
  setActive(View.Calculator);
  renderCalculator();
}

export function activateSettings() {
  setActive(View.Settings);
}

export function activateLastView() {
  // Run the activator for the last view
  VIEW_ACTIVATORS[lastView]();
}

function setActive(view: View) {
  lastView = view;
  document.querySelector("#content .active")!.classList.remove("active");
  document.querySelector("#nav .active")!.classList.remove("active");
  document.querySelector(`.${view}-view`)!.classList.add("active");
  document.querySelector(`#nav-${view}`)!.classList.add("active");

  electron.ipcRenderer.send("set-view", view);
}
