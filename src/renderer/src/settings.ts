export function initSettings() {
  const openAiAPIKey = window.storeGet("openAiAPIKey") || "";
  const openAiAPIKeyInput = document.querySelector(
    "#openai-key"
  ) as HTMLInputElement;
  openAiAPIKeyInput.value = openAiAPIKey;
  openAiAPIKeyInput.addEventListener("change", updateOpenAiAPIKey);

  const activationShortcut = window.storeGet("activationShortcut") || "";
  const activationShortcutInput = document.querySelector(
    "#activation-shortcut"
  ) as HTMLInputElement;
  activationShortcutInput.value = activationShortcut;
  activationShortcutInput.addEventListener("change", updateActivationShortcut);

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

function updateActivationShortcut() {
  const activationShortcutInput = document.querySelector(
    "#activation-shortcut"
  ) as HTMLInputElement;
  window.storeSet("activationShortcut", activationShortcutInput.value);
  // @ts-ignore (define in dts)
  electron.ipcRenderer.send("update-activation-shortcut");
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
