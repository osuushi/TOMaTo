export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    start()
    bindKeys()
  })
}

function start(): void {
  document.querySelector('#settings')!.addEventListener('click', onSettingsClick)
}

function onSettingsClick(): void {
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
