import { renderSearch } from "./search"
import { renderSettings } from "./settings"

export function setupNav() {
  document.querySelector("#nav-search")!.addEventListener("click", activateSearch)
  document.querySelector("#nav-settings")!.addEventListener("click", activateSettings)
  document.querySelector("#nav-chat")!.addEventListener("click", activateChat)
}

export function activateSearch() {
  setActive("search")
  renderSearch()
}

export function activateChat() {
  setActive("chat")
}

export function activateSettings() {
  setActive("settings")
  renderSettings()
}

function setActive(key: string) {
  document.querySelector("#content .active")!.classList.remove("active")
  document.querySelector("#nav .active")!.classList.remove("active")
  document.querySelector(`.${key}-view`)!.classList.add("active")
  document.querySelector(`#nav-${key}`)!.classList.add("active")
}