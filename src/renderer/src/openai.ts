import { Configuration, OpenAIApi } from "openai";

let clientInstance: OpenAIApi | undefined;

export function getClient(): OpenAIApi {
  if (clientInstance) {
    return clientInstance
  }

  const config = new Configuration({
    apiKey: window.storeGet("openAiAPIKey"),
  })

  // Electron doesn't like the User-Agent header being set
  delete config.baseOptions.headers["User-Agent"];

  clientInstance = new OpenAIApi(config);
  return clientInstance
}

export function resetClient() {
  clientInstance = undefined
}


