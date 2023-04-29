import htmlEscape from "html-escape";

// Support for rich output.
//
// Supported chunks are:
//  - text
//  - list

type Chunk = TextChunk | ListChunk;

// Text chunks just render in a p tag
interface TextChunk {
  type: "text";
  content: string;
}

// List chunks render as a select with a size so that they can be selected and
// copied automatically

interface ListChunk {
  type: "list";
  content: string[];
}

export function parseOutput(text: string): Chunk[] {
  const lines = text.split("\n");
  const chunks: Chunk[] = [];
  let currentChunk: Chunk | null = null;
  for (const line of lines) {
    if (isBulletedListItemLine(line)) {
      if (currentChunk === null) {
        currentChunk = { type: "list", content: [] };
        chunks.push(currentChunk);
      } else if (currentChunk.type !== "list") {
        currentChunk = { type: "list", content: [] };
        chunks.push(currentChunk);
      }
      currentChunk.content.push(removeBullet(line));
    } else {
      if (currentChunk === null) {
        currentChunk = { type: "text", content: "" };
        chunks.push(currentChunk);
      } else if (currentChunk.type !== "text") {
        currentChunk = { type: "text", content: "" };
        chunks.push(currentChunk);
      }
      currentChunk.content += line + "\n";
    }
  }
  return chunks;
}

const bulletPattern = /^\s*[*•-]\s+/;

function isBulletedListItemLine(line: string): boolean {
  return bulletPattern.test(line);
}

function removeBullet(line: string): string {
  return line.replace(bulletPattern, "");
}

export function renderOutputHtml(output: string): string {
  const chunks = parseOutput(output);
  return chunks.map(renderChunk).join("\n");
}

function renderChunk(chunk: Chunk): string {
  switch (chunk.type) {
    case "text":
      return renderTextChunk(chunk);
    case "list":
      return renderListChunk(chunk);
  }
}

function renderTextChunk(chunk: TextChunk): string {
  return `<p>${htmlEscape(chunk.content)}</p>`;
}

function renderListChunk(chunk: ListChunk): string {
  const size = Math.min(chunk.content.length, 10);
  return `<select class="output-select" size="${size}">${chunk.content
    .map((item) => `<option>${htmlEscape(item)}</option>`)
    .join("\n")}</select>`;
}
