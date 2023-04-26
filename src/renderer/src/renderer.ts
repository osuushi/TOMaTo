import { setupNav } from "./nav"
import { renderSearch } from "./search"

export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    start()
  })
}

function start(): void {
  bindKeys()
  setupNav()
  renderSearch()
}

function bindKeys() {
  // On escape key, send hide event
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      // @ts-ignore (define in dts)
      electron.ipcRenderer.send('hide')
    }
  })
}

init()
