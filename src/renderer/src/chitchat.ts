import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  OpenAIApi,
} from "openai";
import { Chitchat } from "../../shared/storage";
import { FAKE_CHITCHAT } from "./flags";
import { getClient } from "./openai";
import { dedent } from "ts-dedent";

let executeChitChat: (chitchat: Chitchat, query: string) => Promise<string>;

executeChitChat = async (
  chitchat: Chitchat,
  query: string
): Promise<string> => {
  const client = getClient();

  const messages = messagesForQuery(chitchat, query);

  return await converse(client, chitchat.model, messages);
};

// Set FAKE_CHITCHAT in src/renderer/flags.ts to true to use this fake chitchat
// and avoid using OpenAI in testing
if (FAKE_CHITCHAT) {
  executeChitChat = async (): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve));
    return dedent`
        Sure, here are some fruits:
        • apples
        • bananas
        • pears
        • oranges

        I hope you like those fruits. I like them a lot.
      `;
  };
}

export { executeChitChat };

function messagesForQuery(chitchat: Chitchat, query: string): string[] {
  return chitchat.promptChain.map((prompt) => {
    return prompt.replaceAll("%s", query);
  });
}

async function converse(
  client: OpenAIApi,
  model: string,
  messages: string[]
): Promise<string> {
  const transcript: ChatCompletionRequestMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    transcript.push({
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: messages[i],
    });

    const response = await client.createChatCompletion({
      model,
      messages: transcript,
    });
    const message = response.data.choices[0].message;
    if (!message) {
      return "Sorry, OpenAI responded with an empty message.";
    }

    transcript.push(message);
  }
  return transcript[transcript.length - 1].content;
}
