import { renderSearch } from "./search";
import { renderSettings } from "./settings";
import { renderChat } from "./chat";
import { View } from "../../shared/views";

let lastView = View.Search;

// Mapings of views to activate functions
const VIEW_ACTIVATORS = {
  [View.Search]: activateSearch,
  [View.Chat]: activateChat,
  [View.Settings]: activateSettings,
};

export function currentView(): View {
  return lastView;
}

export function setupNav() {
  document
    .querySelector("#nav-search")!
    .addEventListener("click", activateSearch);
  document
    .querySelector("#nav-settings")!
    .addEventListener("click", activateSettings);
  document.querySelector("#nav-chat")!.addEventListener("click", activateChat);
}

export function activateSearch() {
  setActive(View.Search);
  renderSearch();
}

export function activateChat() {
  setActive(View.Chat);
  renderChat();
}

export function activateSettings() {
  setActive(View.Settings);
  renderSettings();
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
