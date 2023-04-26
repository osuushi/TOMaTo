import { renderSearch } from "./search"
import { renderSettings } from "./settings"

export function setupNav() {
  document.querySelector("#nav-search")!.addEventListener("click", onNavSearchClick)
  document.querySelector("#nav-settings")!.addEventListener("click", onNavSettingsClick)
}

function onNavSearchClick() {
  setActive("search")
  renderSearch()
}

function onNavSettingsClick() {
  setActive("settings")
  renderSettings()
}

function setActive(key: string) {
  document.querySelector("#content .active")!.classList.remove("active")
  document.querySelector("#nav .active")!.classList.remove("active")
  document.querySelector(`.${key}-view`)!.classList.add("active")
  document.querySelector(`#nav-${key}`)!.classList.add("active")
}