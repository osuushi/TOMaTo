export function renderSettings() {
  const openAiAPIKey = window.storeGet("openAiAPIKey") || ""
  const openAiAPIKeyInput = document.querySelector("#openai-key") as HTMLInputElement
  openAiAPIKeyInput.value = openAiAPIKey
  openAiAPIKeyInput.addEventListener("change", updateOpenAiAPIKey)

}

function updateOpenAiAPIKey() {
  const openAiAPIKeyInput = document.querySelector("#openai-key") as HTMLInputElement
  window.storeSet("openAiAPIKey", openAiAPIKeyInput.value)
}