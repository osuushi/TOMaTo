import { ModelName } from "../../shared/storage";
import { Chitchat } from "../../shared/storage";

type ChitchatWithoutUuid = Omit<Chitchat, "uuid">;

const builtinsWithoutUuids: ChitchatWithoutUuid[] = [
  {
    mnemonic: "th",
    fullName: "Thesaurus",
    description: "A loose thesaurus that finds similar words and phrases",
    model: ModelName.Gpt35Turbo,
    promptChain: [
      "Produce a bulleted list with words or phrases that are similar to %s. Do not include any other text",
    ],
  },
  {
    mnemonic: "rd",
    fullName: "Reverse Dictionary",
    description: "Look up a word by its definition and/or connotations",
    model: ModelName.Gpt35Turbo,
    promptChain: [
      "What are some words for %s? Put them in a bulleted list, and do not include any other text.",
    ],
  },
  {
    mnemonic: "emod",
    fullName: "Emotions Dictionary",
    description: "Find behaviors associated with a particular emotion",
    model: ModelName.Gpt35Turbo,
    promptChain: [
      "What are some behaviors a person might display if they were feeling %s? Put them in a bulleted list, and do not include any other text.",
    ],
  },
  {
    mnemonic: "emoth",
    fullName: "Emotions Thesaurus",
    description: "Find behaviors similar to another behavior",
    model: ModelName.Gpt35Turbo,
    promptChain: [
      "What are some alternative behaviors that convey the same emotion as %s? Put them in a bulleted list, and do not include any other text.",
    ],
  },
  {
    mnemonic: "haiku",
    fullName: "Haiku",
    description: "Write a haiku about a topic",
    model: ModelName.Gpt35Turbo,
    promptChain: [
      "Write a short paragraph expanding on the topic of %s.",
      `Write a haiku based on the thoughts above. Avoid words that are too similar to "%s".`,
    ],
  },
];

const builtins: Chitchat[] = builtinsWithoutUuids.map((chitchat) => {
  return {
    ...chitchat,
    uuid: crypto.randomUUID(),
  };
});

export default builtins;
