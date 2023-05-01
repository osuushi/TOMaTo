import { filteredChitChats, wrapChitChats } from "./chitchat_view";
import { onGlobalEvent } from "./globalEvents";
import { executeChitChat } from "./chitchat";
import { renderOutputHtml } from "./output_parser";
import { getServiceInput, getServiceMode } from "./service";

export function setupSearch() {
  onGlobalEvent("chitchats-updated", () => {
    renderSearch();
  });

  const searchInput = getSearchInput();
  searchInput.addEventListener("input", () => {
    renderSearch();
  });
  searchInput.addEventListener("keydown", (e) => {
    const keydownEvent = e as KeyboardEvent;
    if (keydownEvent.key === "Enter") {
      const currentChitChat = filteredChitChats(getQuery())[0];
      if (!currentChitChat) {
        return;
      }

      // If there's no subquery, do nothing
      if (!getSubQuery()) {
        return;
      }

      searchInput.blur();
      // Create the loading overlay
      const loadingOverlay = document.createElement("div");
      loadingOverlay.classList.add("loading-overlay");
      document.body.appendChild(loadingOverlay);

      executeChitChat(currentChitChat, getSubQuery()).then(
        (result) => {
          loadingOverlay.remove();
          const outputScreen = document.createElement("div");
          outputScreen.classList.add("output-screen");
          document.body.appendChild(outputScreen);
          const outputBox = document.createElement("div");
          outputBox.classList.add("output");
          outputBox.dataset.rawOutput = result;
          outputBox.innerHTML = renderOutputHtml(result);
          document.body.appendChild(outputBox);
          // If there's a select, focus it
          const select = outputBox.querySelector("select");
          if (select) {
            select.focus();
          }

          positionOutput();
        },
        (error) => {
          loadingOverlay.remove();
          alert(error);
        }
      );
    }
  });

  renderSearch();
}

export function getSearchInput(): HTMLInputElement {
  return document.querySelector("#search-input")! as HTMLInputElement;
}

export function renderSearch() {
  // Do nothing if search is not active
  if (!document.querySelector(".search-view.active")) {
    return;
  }
  const query = getQuery();
  const wrappers = wrapChitChats(filteredChitChats(query));
  const container = document.querySelector("#search-results")!;
  container.innerHTML = "";
  wrappers.forEach((wrapper) => {
    const element = wrapper.makeWidgetElement();
    container.appendChild(element);
  });

  searchInput().focus();
}

function searchInput(): HTMLInputElement {
  return document.querySelector("#search-input") as HTMLInputElement;
}

function getQuery(): string {
  return searchInput().value;
}

function getSubQuery(): string {
  // If we're in service mode, the query is the service input
  if (getServiceMode()) {
    return getServiceInput();
  }

  const query = getQuery();
  const words = query.split(" ");
  words.shift();
  return words.join(" ");
}

function positionOutput() {
  const outputBox = document.querySelector(".output") as
    | HTMLDivElement
    | undefined;
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

export function initEnforcerLoop() {
  // Animation frame loop to resize output box
  function loop() {
    positionOutput();
    // If we're on the search screen and there's no output, or editor, focus the search input
    const searchInput = document.querySelector(
      "#search-input"
    ) as HTMLInputElement;
    const outputScreen = document.querySelector(".output-screen");
    const editor = document.querySelector(".chitchat-editor");
    if (
      document.querySelector(".search-view.active") &&
      !outputScreen &&
      !editor
    ) {
      searchInput.focus();
    } else {
      // Otherwise make sure the search input is not focused
      searchInput.blur();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
