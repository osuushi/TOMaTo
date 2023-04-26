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

// Listen for activate messages from the background process
window.electron.ipcRenderer.on('activate', () => {
  // Focus the search input if it's there
  const searchInput = document.querySelector('#search-input') as HTMLInputElement
  if (searchInput) {
    searchInput.focus()
  }
})

init()
