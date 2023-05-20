import {
  setupNav,
  activateChat,
  activateSearch,
  activateSettings,
  activateLastView,
  activateCalculator,
  currentView,
} from "./nav";
import { initEnforcerLoop, renderSearch, setupSearch } from "./search";
import { setupChat } from "./chat";
import { endServiceMode, getServiceMode, initMacosService } from "./service";
import { ServiceInvocationCanceledSentinel } from "../../shared/constants";
import { getCalcInput, setupCalculator } from "./calculator";

export function init(): void {
  window.addEventListener("DOMContentLoaded", () => {
    start();
  });
}

function start(): void {
  bindKeys();
  setupNav();
  setupSearch();
  setupChat();
  setupCalculator();
  initEnforcerLoop();
  initMacosService();
}

function bindKeys() {
  // On escape key, hide according to the current state
  document.addEventListener("keydown", (e) => {
    const searchInput = document.querySelector(
      "#search-input"
    ) as HTMLInputElement;

    const outputScreen = document.querySelector(".output-screen");
    const editor = document.querySelector(".chitchat-editor");
    const hideOutput = () => {
      outputScreen?.remove();
      const output = document.querySelector(".output");
      if (output) {
        output.remove();
      }
      searchInput.focus();
    };

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();

      switch (currentView()) {
        case "search":
          // If there's an output, hide it and the screen
          if (outputScreen) {
            hideOutput();
            // If we're in service mode, cancel it now
            if (getServiceMode()) {
              endServiceMode(ServiceInvocationCanceledSentinel);
              searchInput.value = "";
              renderSearch();
              // Hide
              // @ts-ignore (define in dts)
              electron.ipcRenderer.send("hide");
            }
            return;
          }

          if (editor) {
            editor.remove();
            return;
          }

          // If there's text in the search input, clear it
          if (searchInput.value) {
            searchInput.value = "";
            searchInput.focus();
            renderSearch();
            return;
          }
          break;
        case "calc": {
          // If there's text in the calculator input, clear it and focus
          const inputEl = getCalcInput();
          if (inputEl.value) {
            inputEl.value = "";
            inputEl.focus();
            return;
          }
        }
      }
      // @ts-ignore (define in dts)
      electron.ipcRenderer.send("hide");
    } else if (e.key == "Enter") {
      if (outputScreen) {
        // If there's a select focused, send a copy command to the main process
        const select = document.querySelector(
          "select:focus"
        ) as HTMLSelectElement | null;
        if (select) {
          // Check if there's a selected option
          const selectedOption = select.options[select.selectedIndex];
          if (selectedOption) {
            if (getServiceMode()) {
              endServiceMode(selectedOption.value);
              // @ts-ignore (define in dts)
              electron.ipcRenderer.send("hide");
            } else {
              // @ts-ignore (define in dts)
              electron.ipcRenderer.send("copy", selectedOption.value);
            }
          }
        }
        if (getServiceMode()) {
          // If there's an output box, send the raw output out and hide
          const outputEl = document.querySelector(
            ".output"
          ) as HTMLElement | null;
          if (outputEl) {
            const result = outputEl.dataset.rawOutput!;
            endServiceMode(result);
            // @ts-ignore (define in dts)
            electron.ipcRenderer.send("hide");
          }
        }
        hideOutput();
        searchInput.focus();
        return;
      }
    } else if (e.key === "c" && (e.metaKey || e.ctrlKey)) {
      const output = document.querySelector(".output")?.textContent;
      if (output) {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore (define in dts)
        electron.ipcRenderer.send("copy", output);
        return;
      }
    } else if (e.key === "1" && (e.metaKey || e.ctrlKey)) {
      activateSearch();
    } else if (e.key === "2" && (e.metaKey || e.ctrlKey)) {
      activateChat();
    } else if (e.key === "3" && (e.metaKey || e.ctrlKey)) {
      activateCalculator();
    } else if (e.key === "4" && (e.metaKey || e.ctrlKey)) {
      activateSettings();
    }
  });
}

// Listen for activate messages from the background process
window.electron.ipcRenderer.on("activate", () => {
  activateLastView();
});

init();
