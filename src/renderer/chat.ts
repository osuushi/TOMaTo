import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
import { getClient } from "./src/openai";
import { ModelName } from "../shared/storage";

let instance: ChatView

export function setupChat() {
  instance = new ChatView()
}

export function renderChat() {
  instance.render()
}

export class ChatView {
  messages: ChatCompletionRequestMessage[] = []

  get sendButton(): HTMLButtonElement {
    return document.querySelector('#chat-input-send') as HTMLButtonElement
  }

  get input(): HTMLInputElement {
    return document.querySelector('#chat-input-text') as HTMLInputElement
  }

  get message(): string {
    return this.input.value
  }


  constructor() {
    this.input.addEventListener('keydown', (event: KeyboardEvent) => {
      // Check if command-enter was pressed
      if (event.key === 'Enter' && event.metaKey) {
        this.acceptChat()
      }
    });

    this.sendButton.addEventListener('click', () => {
      this.acceptChat()
    })
  }

  addUserMessage(message: string) {
    this.messages.push({
      content: message,
      role: ChatCompletionRequestMessageRoleEnum.User
    })
  }

  addAIResponse(message: string) {
    this.messages.push({
      content: message,
      role: ChatCompletionRequestMessageRoleEnum.Assistant
    })
  }

  async acceptChat() {
    let client = getClient()
    this.addUserMessage(this.message)
    this.input.value = ''

    let response = await client.createChatCompletion({
      messages: this.messages,
      model: ModelName.Gpt35Turbo,
    })

    let responseMessage = response?.data?.choices[0]?.message?.content
    if (responseMessage && responseMessage.length > 0) {
      this.addAIResponse(responseMessage)
    }

    this.renderMessages()

    this.input.focus()
  }

  get messagesDiv(): HTMLDivElement {
    return document.querySelector('#chat-messages') as HTMLDivElement
  }

  renderMessages() {
    this.messagesDiv.innerHTML = this.messages.map(this.renderMessage).join('')
  }

  renderMessage(message: ChatCompletionRequestMessage) {
    return `<div class="chat-message ${message.role}">${message.role === ChatCompletionRequestMessageRoleEnum.User ? "You" : "ChatGPT"}: ${message.content}</div>`
  }

  render() {
    this.input.focus()
  }
}