import { ChatCompletionRequestMessageRoleEnum } from "openai";
import { ModelName } from "../../shared/storage";
import { getClient } from "./openai";
import { dedent } from "ts-dedent";

export function renderCalculator() {
  if (!document.querySelector(".calc-view.active")) {
    return;
  }
}

let isCalculating = false;
export function setupCalculator() {
  const inputEl = getCalcInput();
  const modelSwitchEl = document.querySelector(
    "#calc-model-switch"
  ) as HTMLInputElement;
  modelSwitchEl.checked = window.storeGet("calculatorModel") === ModelName.Gpt4;
  inputEl.addEventListener("keydown", (e) => {
    // If enter key is pressed, handle the input
    if (e.key === "Enter") {
      e.preventDefault();
      if (isCalculating) {
        return;
      }
      isCalculating = true;
      calculate();
    }
  });

  modelSwitchEl.addEventListener("change", () => {
    window.storeSet(
      "calculatorModel",
      modelSwitchEl.checked ? ModelName.Gpt4 : ModelName.Gpt35Turbo
    );
  });
}

export function getCalcInput() {
  return document.querySelector("#calc-input") as HTMLTextAreaElement;
}

function getOutput() {
  return document.querySelector("#calc-result") as HTMLDivElement;
}

async function calculate(): Promise<void> {
  const inputEl = getCalcInput();
  const outputEl = getOutput();
  const inputValue = inputEl.value;
  const loadingOverlay = document.createElement("div");
  loadingOverlay.classList.add("loading-overlay");
  document.body.appendChild(loadingOverlay);
  try {
    let code = await generateCode(inputValue);

    const result = await electron.ipcRenderer.invoke("run-calculation", code);
    outputEl.classList.remove("error");
    outputEl.textContent = result;
  } catch (e) {
    if (e instanceof Error) {
      outputEl.textContent = e.message;
    } else {
      outputEl.textContent = "Unknown error";
    }
    outputEl.classList.add("error");
  } finally {
    loadingOverlay.remove();
    isCalculating = false;
  }
}

async function generateCode(input: string): Promise<string> {
  const client = getClient();
  const prompt = dedent`
  Write a javascript snippet that answers the following question:

  ${input}
  Your code must be preceded by "%START_CODE%" and followed immediately by "%END_CODE%".
  Do not rely on your memory for calculations, but instead compute things algorithmically whenever possible.
  Do not use console.log or any libraries.
  Be concise.
  The last statement in your code must evaluate to the final answer.
  Only write the code. Don't comment on it, or explain what it does.
  `;

  const response = await client.createChatCompletion({
    model: window.storeGet("calculatorModel"),
    messages: [
      {
        content: prompt,
        role: ChatCompletionRequestMessageRoleEnum.User,
      },
    ],
    stop: ["%END_CODE%"],
  });

  if (response.data.choices.length === 0) {
    throw new Error("No code generated");
  }
  let code = response.data.choices[0].message?.content;
  if (!code) {
    throw new Error("No code generated");
  }

  const codeParts = code.split("%START_CODE%");
  if (codeParts.length === 1) {
    code = codeParts[0];
  } else {
    code = codeParts[1];
  }

  return code;
}
