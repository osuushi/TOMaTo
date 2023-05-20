export function initSettings() {
  const openAiAPIKey = window.storeGet("openAiAPIKey") || "";
  const openAiAPIKeyInput = document.querySelector(
    "#openai-key"
  ) as HTMLInputElement;
  openAiAPIKeyInput.value = openAiAPIKey;
  openAiAPIKeyInput.addEventListener("change", updateOpenAiAPIKey);

  bindShortcutField("#global-search-shortcut", "activationShortcut");
  bindShortcutField("#global-calculator-shortcut", "calculatorShortcut");

  const hideDockIcon = window.storeGet("hideDockIcon") || false;
  const hideDockIconInput = document.querySelector(
    "#hide-dock-icon"
  ) as HTMLInputElement;
  hideDockIconInput.checked = hideDockIcon;
  hideDockIconInput.addEventListener("change", updateHideDockIcon);

  const installServiceButton = document.querySelector(
    "#service-button"
  ) as HTMLButtonElement;
  installServiceButton.addEventListener("click", installService);
}

function updateOpenAiAPIKey() {
  const openAiAPIKeyInput = document.querySelector(
    "#openai-key"
  ) as HTMLInputElement;
  window.storeSet("openAiAPIKey", openAiAPIKeyInput.value);
}

function bindShortcutField(id: string, key: string) {
  const shortcutInput = document.querySelector(id) as HTMLInputElement;
  shortcutInput.value = window.storeGet(key) || "";
  shortcutInput.addEventListener("change", () =>
    updateShortcut(shortcutInput, key)
  );
}

function updateShortcut(el: HTMLInputElement, key: string) {
  window.storeSet(key, el.value);
  // @ts-ignore (define in dts)
  electron.ipcRenderer.send("update-global-shortcuts");
}

function updateHideDockIcon() {
  const hideDockIconInput = document.querySelector(
    "#hide-dock-icon"
  ) as HTMLInputElement;
  // Don't allow hiding the dock icon if there's no activation shortcut
  if (hideDockIconInput.checked && !window.storeGet("activationShortcut")) {
    hideDockIconInput.checked = false;
    hideDockIconInput.setCustomValidity(
      "You must set an activation shortcut before hiding the dock icon"
    );
    hideDockIconInput.reportValidity();
    return;
  }
  window.storeSet("hideDockIcon", hideDockIconInput.checked);
  // @ts-ignore (define in dts)
  electron.ipcRenderer.send("update-hide-dock-icon");
}
function installService() {
  electron.ipcRenderer.send("open-workflows");
}
