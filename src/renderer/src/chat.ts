let instance: ChatView

export function setupChat() {
  instance = new ChatView()
}

export function renderChat() {
  instance.render()
}

export class ChatView {
  get input(): HTMLInputElement {
    return document.querySelector('#chat-input-text') as HTMLInputElement
  }

  constructor() {
    this.input.addEventListener('keydown', (event: KeyboardEvent) => {
      // Check if command-enter was pressed
      if (event.key === 'Enter' && event.metaKey) {
        alert(this.input.value)
      }
    });
  }

  render() {
    this.input.focus()
  }
}