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

  render() {
    this.input.focus()
  }
}