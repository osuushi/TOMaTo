import { filteredChitChats, wrapChitChats } from "../chitchat";
import { onGlobalEvent } from "../globalEvents";

export function setupSearch() {
  onGlobalEvent("chitchats-updated", () => {
    renderSearch();
  })

  document.querySelector("#search-input")!.addEventListener("input", () => {
    renderSearch();
  })
}

export function renderSearch() {
  // Do nothing if search is not active
  if (!document.querySelector(".search-view.active")) {
    return;
  }
  const query = getQuery()
  const wrappers = wrapChitChats(filteredChitChats(query));
  const container = document.querySelector("#search-results")!;
  container.innerHTML = "";
  wrappers.forEach(wrapper => {
    const element = wrapper.makeWidgetElement();
    container.appendChild(element);
  })
}

function getQuery(): string {
  return (document.querySelector("#search-input") as HTMLInputElement).value;
}
