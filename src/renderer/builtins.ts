import { Chitchat } from "../shared/storage";

const builtins: Chitchat[] = [{
  uuid: crypto.randomUUID(),
  mnemonic: "th",
  fullName: "Thesaurus",
  description: "A loose thesaurus that finds similar words and phrases",
  model: "gpt-3.5-turbo",
  promptChain: [
    "Produce a bulleted list with words or phrases that are similar to %s. Do not include any other text"
  ],
},
{
  uuid: crypto.randomUUID(),
  mnemonic: "rd",
  fullName: "Reverse Dictionary",
  description: "Look up a word by its definition and/or connotations",
  model: "gpt-3.5-turbo",
  promptChain: [
    "What are some words for %s? Put them in a bulleted list, and do not include any other text."
  ]
},
{
  uuid: crypto.randomUUID(),
  mnemonic: "emod",
  fullName: "Emotions Dictionary",
  description: "Find behaviors associated with a particular emotion",
  model: "gpt-3.5-turbo",
  promptChain: [
    "What are some behaviors a person might display if they were feeling %s? Put them in a bulleted list, and do not include any other text."
  ]
},
{
  uuid: crypto.randomUUID(),
  mnemonic: "haiku",
  fullName: "Haiku",
  description: "Write a haiku about a topic",
  model: "gpt-3.5-turbo",
  promptChain: [
    "Write a short paragraph expanding on the topic of %s.",
    `Write a haiku based on the thoughts above. Avoid words that are too similar to "%s".`
  ]
}
];

export default builtins;