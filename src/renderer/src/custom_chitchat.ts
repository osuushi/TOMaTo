const promptDelimiter = /^@{3,}\s*$/gm;
const canonicalPromptDelimiter = "@@@";

export function parseChitchatPrompts(s: string): string[] {
  return s
    .split(promptDelimiter)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function stringifyPrompts(prompts: string[]): string {
  return prompts.join(`\n\n${canonicalPromptDelimiter}\n\n`);
}
