import { setupNav } from "./nav"
import { initEnforcerLoop, renderSearch, setupSearch } from "./search"

export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    start()
  })
}

function start(): void {
  bindKeys()
  setupNav()
  setupSearch()
  initEnforcerLoop()
}

function bindKeys() {
  // On escape key, hide according to the current state
  document.addEventListener('keydown', (e) => {
    const searchInput = document.querySelector('#search-input') as HTMLInputElement
    const outputScreen = document.querySelector('.output-screen')
    const editor = document.querySelector('.chitchat-editor')
    const hideOutput = () => {
      outputScreen?.remove()
      const output = document.querySelector('.output')
      if (output) {
        output.remove()
      }
      searchInput.focus();
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      // If there's an output, hide it and the screen
      if (outputScreen) {
        hideOutput()
        return
      }

      if (editor) {
        editor.remove();
        return
      }

      // If there's text in the search input, clear it
      if (searchInput.value) {
        searchInput.value = ''
        searchInput.focus();
        renderSearch();
        return
      }

      // @ts-ignore (define in dts)
      electron.ipcRenderer.send('hide')
    } else if (e.key == "Enter") {
      if (outputScreen) {
        hideOutput()
        searchInput.focus();
        return
      }
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
