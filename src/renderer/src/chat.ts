import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { Chitchat } from "../../shared/storage";

export async function executeChitChat(chitchat: Chitchat, query: string): Promise<string> {
  const config = new Configuration({
    apiKey: window.storeGet("openAiAPIKey"),
  })

  // Electron doesn't like the User-Agent header being set
  delete config.baseOptions.headers["User-Agent"];

  const client = new OpenAIApi(config);
  const messages = messagesForQuery(chitchat, query)

  return await converse(client, chitchat.model, messages);
}

function messagesForQuery(chitchat: Chitchat, query: string): string[] {
  return chitchat.promptChain.map(prompt => {
    return prompt.replaceAll("%s", query)
  })
}

async function converse(client: OpenAIApi, model: string, messages: string[]): Promise<string> {
  const transcript: ChatCompletionRequestMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    transcript.push({
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: messages[i],
    })

    const response = await client.createChatCompletion({
      model,
      messages: transcript,
    })
    const message = response.data.choices[0].message
    if (!message) {
      return "Sorry, OpenAI responded with an empty message.";
    }

    transcript.push(message);
  }
  return transcript[transcript.length - 1].content;
}