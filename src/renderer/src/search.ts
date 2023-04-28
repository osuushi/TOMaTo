import { filteredChitChats, wrapChitChats } from "../chitchat";
import { onGlobalEvent } from "../globalEvents";
import { executeChitChat } from "./chat";

export function setupSearch() {
  onGlobalEvent("chitchats-updated", () => {
    renderSearch();
  })

  const searchInput = document.querySelector("#search-input")! as HTMLInputElement;
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
      searchInput.blur();
      // Create the loading overlay
      const loadingOverlay = document.createElement("div");
      loadingOverlay.classList.add("loading-overlay");
      document.body.appendChild(loadingOverlay);

      executeChitChat(currentChitChat, getSubQuery()).then((result) => {
        loadingOverlay.remove();
        const outputScreen = document.createElement("div");
        outputScreen.classList.add("output-screen");
        document.body.appendChild(outputScreen);
        const outputBox = document.createElement("div");
        outputBox.classList.add("output");
        outputBox.textContent = result;
        document.body.appendChild(outputBox);
        positionOutput();
      }, (error) => {
        loadingOverlay.remove();
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

function positionOutput() {
  const outputBox = document.querySelector(".output") as HTMLDivElement | undefined;
  if (!outputBox) {
    return;
  }

  // Center the absolutely positioned output box in the window
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const outputWidth = outputBox.offsetWidth;
  const outputHeight = outputBox.offsetHeight;
  outputBox.style.left = `${(windowWidth - outputWidth) / 2}px`;
  outputBox.style.top = `${(windowHeight - outputHeight) / 2}px`;
}

export function initOutputResizer() {
  // Animation frame loop to resize output box
  function resizeOutput() {
    positionOutput();
    requestAnimationFrame(resizeOutput);
  }
  requestAnimationFrame(resizeOutput);
}