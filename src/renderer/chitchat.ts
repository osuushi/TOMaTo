import { Chitchat, ModelName } from "../shared/storage";
import htmlEscape from "html-escape";
import builtins from "./builtins";
import { triggerGlobalEvent } from "./globalEvents";
import { parseChitchatPrompts, stringifyPrompts } from "./custom_chitchat";

class ChitchatWrapper {
  chitchat: Chitchat;
  constructor(chitchat: Chitchat) {
    this.chitchat = chitchat;
  }

  renderWidget() {
    const mnemonic = htmlEscape(this.chitchat.mnemonic);
    const fullName = htmlEscape(this.chitchat.fullName);
    const description = htmlEscape(this.chitchat.description);
    return `
      <div class="chitchat">
        <div class="chitchat-header">
          <span class="mnemonic">${mnemonic}</span>
          <span class="full-name">${fullName}</span>
        </div>
        <div class="chitchat-description">${description}</div>
        <div class="chitchat-buttons">
          <button class="chitchat-edit" title="Edit">✏️</button>
          <button class="chitchat-duplicate" title="Duplicate">📑</button>
          <button class="chitchat-delete" title="Delete">🚫</button>
        </div>
      </div>
    `
  }

  renderEditor() {
    const mnemonic = htmlEscape(this.chitchat.mnemonic);
    const model = htmlEscape(this.chitchat.model);
    const fullName = htmlEscape(this.chitchat.fullName);
    const description = htmlEscape(this.chitchat.description);
    const prompts = htmlEscape(stringifyPrompts(this.chitchat.promptChain));
    return `
      <div class="chitchat-editor" data-uuid="${this.chitchat.uuid}">
        <div>
          <label for="chitchat-mnemonic">Mnemonic</label>
          <input type="text" id="chitchat-mnemonic" value="${mnemonic}">
        </div>
        <div>
          <label for="chitchat-full-name">Full Name</label>
          <input type="text" id="chitchat-full-name" value="${fullName}">
        </div>
        <div>
          <label for="chitchat-description">Description</label>
          <input type="text" id="chitchat-description" value="${description}">
        </div>
        <div>
          <label for="chitchat-model">Model</label>
          <select id="chitchat-model">
            <option value="gpt-3.5-turbo" ${model === "gpt-3.5-turbo" ? "selected" : ""}>GPT-3.5 Turbo</option>
            <option value="gpt-4" ${model === "gpt-4" ? "selected" : ""}>GPT-4</option>
          </select>
        </div>
        <div class="description-container">
          <label for="chitchat-prompts">Prompts</label>
          <p>Use %s to indicate where the input should go. You can use it more than once.</p>
          <p>Separate prompts with @@@ on its own line to form a chain</p>
          <textarea id="chitchat-prompts">${prompts}</textarea>
        <div>
          <button class="chitchat-save">Save</button>
          <button class="chitchat-cancel">Cancel</button>
        </div>
      </div>
    `
  }

  makeElement(html: string): HTMLDivElement {
    const element = document.createElement("div");
    element.innerHTML = html;
    return element.firstElementChild as HTMLDivElement;
  }

  makeWidgetElement(): HTMLDivElement {
    const element = this.makeElement(this.renderWidget());

    element.querySelector(".chitchat-duplicate")!.addEventListener("click", () => {
      this.duplicate();
    });

    if (isBuiltIn(this.chitchat)) {
      element.querySelector(".chitchat-delete")!.remove();
      element.querySelector(".chitchat-edit")!.remove();
    } else {
      element.querySelector(".chitchat-delete")!.addEventListener("click", () => {
        this.delete();
      });
      element.querySelector(".chitchat-edit")!.addEventListener("click", () => {
        this.edit();
      });
    }
    return element;
  }

  makeEditorElement(): HTMLDivElement {
    const element = this.makeElement(this.renderEditor());
    element.querySelector(".chitchat-save")!.addEventListener("click", () => {
      this.save(element);
    });
    element.querySelector(".chitchat-cancel")!.addEventListener("click", () => {
      element.remove();
    });
    return element
  }

  save(element: HTMLDivElement) {
    const customs = customChitchats();
    let index = customs.findIndex(chitchat => chitchat.uuid === this.chitchat.uuid);
    const newChitchat = {
      ...this.chitchat,
      model: (element.querySelector("#chitchat-model") as HTMLSelectElement).value as ModelName,
      mnemonic: (element.querySelector("#chitchat-mnemonic") as HTMLInputElement).value,
      fullName: (element.querySelector("#chitchat-full-name") as HTMLInputElement).value,
      description: (element.querySelector("#chitchat-description") as HTMLInputElement).value,
      promptChain: parseChitchatPrompts((element.querySelector("#chitchat-prompts") as HTMLTextAreaElement).value),
    }
    if (index === -1) {
      index = customs.length;
    }

    customs[index] = newChitchat;
    window.storeSet("chitchats", customs);
    triggerGlobalEvent("chitchats-updated");
    element.remove();
  }

  edit() {
    const editor = this.makeEditorElement();
    // Show the editor
    document.body.appendChild(editor);
  }

  duplicate() {
    const newChitchat = {
      ...this.chitchat,
      uuid: crypto.randomUUID(),
      mnemonic: ``,
      fullName: `${this.chitchat.fullName} (copy)`,
    }
    const wrapper = new ChitchatWrapper(newChitchat);
    wrapper.edit();
  }

  delete() {
    let all = allChitChats();
    all = all.filter(chitchat => chitchat.uuid !== this.chitchat.uuid);
    window.storeSet("chitchats", all);
    triggerGlobalEvent("chitchats-updated");
  }
}


export function allChitChats(): Chitchat[] {
  const customs: Chitchat[] = customChitchats();
  customs.reverse(); // this shows last created first
  return [...builtins, ...customs]
}

function customChitchats(): Chitchat[] {
  return window.storeGet("chitchats") || [];
}

export function filteredChitChats(filterText: string): Chitchat[] {
  const all = allChitChats();
  const searchWord = filterText.split(' ')[0].toLowerCase();
  if (searchWord === '') {
    return all;
  }

  // If any chitchat has an exact match for the mnemonic, it goes first
  const mnemonicMatch = all.find(chitchat => chitchat.mnemonic.toLowerCase() === searchWord);

  // Create the fuzzyfind pattern, which is just a regex with .* between each
  // letter. Escape each letter first
  const fuzzyFindPattern = searchWord.split('').map(char => `.*${escapeRegExp(char)}`).join('.*');
  const fuzzyFindRegex = new RegExp(fuzzyFindPattern, 'i');
  let fuzzyFindMatches = all.filter(chitchat => fuzzyFindRegex.test(chitchat.fullName + chitchat.description));
  // If there's an exact match, remove it from the fuzzyfind matches
  if (mnemonicMatch) {
    fuzzyFindMatches = [
      mnemonicMatch,
      ...fuzzyFindMatches.filter(chitchat => chitchat.uuid !== mnemonicMatch.uuid)
    ]
  }
  return fuzzyFindMatches;
}

export function wrapChitChats(chitchats: Chitchat[]): ChitchatWrapper[] {
  return chitchats.map(chitchat => new ChitchatWrapper(chitchat))
}

function escapeRegExp(char: string): string {
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isBuiltIn(chitchat: Chitchat): boolean {
  return builtins.some(builtin => builtin.uuid === chitchat.uuid);
}
