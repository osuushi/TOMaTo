import { setupNav } from "./nav"
import { initOutputResizer, renderSearch, setupSearch } from "./search"

export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    start()
  })
}

function start(): void {
  bindKeys()
  setupNav()
  setupSearch()
  initOutputResizer()
}

function bindKeys() {
  // On escape key, hide according to the current state
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      // If there's an output, hide it and the screen
      const outputScreen = document.querySelector('.output-screen')
      if (outputScreen) {
        outputScreen.remove()
        const output = document.querySelector('.output')
        if (output) {
          output.remove()
        }
        return
      }

      // If there's text in the search input, clear it
      const searchInput = document.querySelector('#search-input') as HTMLInputElement
      if (searchInput.value) {
        searchInput.value = ''
        searchInput.focus();
        renderSearch();
        return
      }

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
