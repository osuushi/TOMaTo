import { filteredChitChats, wrapChitChats } from "../chitchat";
import { onGlobalEvent } from "../globalEvents";
import { executeChitChat } from "./chat";

export function setupSearch() {
  onGlobalEvent("chitchats-updated", () => {
    renderSearch();
  })

  const searchInput = document.querySelector("#search-input")!;
  searchInput.addEventListener("input", () => {
    renderSearch();
  })
  searchInput.addEventListener("keydown", (e) => {
    const keydownEvent = e as KeyboardEvent;
    if (keydownEvent.key === "Enter") {
      const currentChitChat = filteredChitChats(getQuery())[0];
      if (!currentChitChat) {
        return;
      }
      executeChitChat(currentChitChat, getSubQuery()).then((result) => {
        alert(result);
      }, (error) => {
        alert(error);
      })
    }
  })

  renderSearch();
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

function getSubQuery(): string {
  const query = getQuery();
  const words = query.split(" ");
  words.shift();
  return words.join(" ");
}