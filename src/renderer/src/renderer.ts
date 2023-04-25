export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    start()
  })
}

function start(): void {
  document.querySelector('#settings')!.addEventListener('click', onSettingsClick)
}

function onSettingsClick(): void {
}

init()
