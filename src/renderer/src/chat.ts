import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
import { getApiKey } from "./openai";
import { ModelName } from "../../shared/storage";
import { OpenAI as OpenAIStream } from 'openai-streams'
import { yieldStream } from "yield-stream";

let instance: ChatView

export function setupChat() {
  instance = new ChatView()
}

export function renderChat() {
  instance.render()
}

const liveMessage = '<div class="chat-message agent live"></div>'

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
    this.addUserMessage(this.message)
    this.renderMessages()
    this.input.value = ''

    const stream = await OpenAIStream("chat", {
      messages: this.messages,
      model: ModelName.Gpt35Turbo,
    }, {
      // I'll fix this later I guess
      apiKey: getApiKey(),
    })

    const generator = yieldStream(stream)

    const setResponse = (val) => {
      this.liveMessage.textContent = val
    }

    this.setLiveLoading(true);

    let currentMessage = '';
    const decoder = new TextDecoder();
    for await (const chunk of generator) {
      currentMessage += decoder.decode(chunk)
      setResponse(currentMessage)
    }

    this.setLiveLoading(false);

    this.addAIResponse(currentMessage);
    this.renderMessages()

    this.input.focus()
  }

  setLiveLoading(loading: boolean) {
    if (loading) {
      this.liveMessage.classList.add('loading')
    } else {
      this.liveMessage.classList.remove('loading')
    }
  }

  get liveMessage(): HTMLDivElement {
    return document.querySelector('#chat-messages .chat-message.agent.live') as HTMLDivElement
  }

  get messagesDiv(): HTMLDivElement {
    return document.querySelector('#chat-messages') as HTMLDivElement
  }

  renderMessages() {
    this.messagesDiv.innerHTML = this.messages.map(this.renderMessage).join('') + liveMessage
  }

  renderMessage(message: ChatCompletionRequestMessage) {
    return `<div class="chat-message ${message.role}">${message.role === ChatCompletionRequestMessageRoleEnum.User ? "You" : "ChatGPT"}: ${message.content}</div>`
  }

  render() {
    this.renderMessages()
    this.input.focus()
  }
}
