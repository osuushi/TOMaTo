import { setupNav, activateChat, activateSearch, activateSettings, activateLastView } from "./nav"
import { initEnforcerLoop, renderSearch, setupSearch } from "./search"
import { setupChat } from "./chat"

export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    start()
  })
}

function start(): void {
  bindKeys()
  setupNav()
  setupSearch()
  setupChat()
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
        // If there's a select focused, send a copy command to the main process
        const select = document.querySelector('select:focus') as HTMLSelectElement | null
        if (select) {
          // Check if there's a selected option
          const selectedOption = select.options[select.selectedIndex]
          if (selectedOption) {
            // @ts-ignore (define in dts)
            electron.ipcRenderer.send('copy', selectedOption.value)
          }
        }

        hideOutput()
        searchInput.focus();
        return
      }
    } else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
      const output = document.querySelector('.output')?.textContent
      if (output) {
        e.preventDefault()
        e.stopPropagation()
        // @ts-ignore (define in dts)
        electron.ipcRenderer.send('copy', output)
        return
      }
    } else if (e.key === '1' && (e.metaKey || e.ctrlKey)) {
      activateSearch()
    } else if (e.key === '2' && (e.metaKey || e.ctrlKey)) {
      activateChat()
    } else if (e.key === '3' && (e.metaKey || e.ctrlKey)) {
      activateSettings()
    }
  })
}

// Listen for activate messages from the background process
window.electron.ipcRenderer.on('activate', () => {
  activateLastView()
})

init()
