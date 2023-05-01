import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
import { getApiKey } from "./openai"
import { ModelName } from "../../shared/storage"
import { OpenAI as OpenAIStream } from 'openai-streams'
import { yieldStream } from "yield-stream"
import { marked } from 'marked'

let instance: ChatView

type ChatMessage = {
  html?: string,
  hidden?: boolean,
  message: ChatCompletionRequestMessage,
}

export function setupChat() {
  instance = new ChatView()
}

export function renderChat() {
  instance.render()
}

export class ChatView {
  messages: ChatMessage[] = [
    {
      message: {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: "You are ChatGPT, a helpful and friendly AI, you will answer questions from a human.  Answer consisely and format your answers with markdown, unless instructed otherwise.",
      },
      hidden: true,
    },
    {
      message: {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: "Okay, I'm ready to answer questions.",
      },
      hidden: true,
    },
  ]

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
      message: {
        content: message,
        role: ChatCompletionRequestMessageRoleEnum.User
      }
    })
  }

  addAIResponse(message: string) {
    this.messages.push({
      message: {
        content: message,
        role: ChatCompletionRequestMessageRoleEnum.Assistant
      }
    })
  }

  async acceptChat() {
    this.addUserMessage(this.message)
    this.renderMessages()
    this.input.value = ''

    const stream = await OpenAIStream("chat", {
      messages: this.messages.map(chat => chat.message),
      model: ModelName.Gpt35Turbo,
    }, {
      // I'll fix this later I guess
      apiKey: getApiKey(),
    })

    const generator = yieldStream(stream)

    const setResponse = (val) => {
      this.liveMessageContent.innerHTML = marked.parse(val)
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

  get liveMessageContent() {
    return document.querySelector('#chat-messages .chat-message.live .chat-content') as HTMLDivElement
  }

  get liveMessage(): HTMLDivElement {
    return document.querySelector('#chat-messages .chat-message.live') as HTMLDivElement
  }

  get messagesDiv(): HTMLDivElement {
    return document.querySelector('#chat-messages') as HTMLDivElement
  }

  renderMessages() {
    const liveHTML = this.renderMessage({ message: { content: '', role: ChatCompletionRequestMessageRoleEnum.Assistant } }, true)
    this.messagesDiv.innerHTML = this.messages.map(msg => this.renderMessage(msg, false)).join('') + liveHTML;
  }

  renderMessage(chat: ChatMessage, isLive: boolean = false) {
    if (chat.hidden) {
      return ''
    }

    if (!chat.html) {
      let html = `
        <div class="chat-message ${chat.message.role} ${isLive ? "live" : ""}">
          <div class="author-id">${chat.message.role === ChatCompletionRequestMessageRoleEnum.User ? "👤" : "🤖"}</div>
          <div class="chat-content">${marked.parse(chat.message.content)}</div>
        </div>`
      chat.html = html
    }

    return chat.html
  }

  render() {
    this.renderMessages()
    this.input.focus()
  }
}
