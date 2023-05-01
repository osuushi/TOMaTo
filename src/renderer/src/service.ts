// This handles switching the app mode to service mode, which is used for the
// macOS service for inline text replacement

import { activateSearch } from "./nav";
import { getSearchInput } from "./search";

let isInServiceMode = false;
let currentServiceInput = "";

export function endServiceMode(result: string) {
  electron.ipcRenderer.send("service-output", result);
  isInServiceMode = false;
  currentServiceInput = "";
  getSearchInput().value = "";
  activateSearch();
}

export function getServiceMode(): boolean {
  return isInServiceMode;
}

export function getServiceInput(): string {
  return currentServiceInput;
}

export function initMacosService() {
  electron.ipcRenderer.on("service-input", (_, input) => {
    console.log("Got service input", input);
    isInServiceMode = true;
    currentServiceInput = input;
    activateSearch();
  });
}
