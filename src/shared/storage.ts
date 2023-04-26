// Schema for a settings

import { Schema } from "electron-store"

export const schema: Schema<any> = {
  openAiAPIKey: {
    type: 'string',
    default: '',
  },
  chitchats: {
    type: "array",
    items: {
      type: "object",
      properties: {
        fullName: { type: "string" },
        mnemonic: { type: "string" },
        description: { type: "string" },
        promptChain: {
          type: "array",
          items: {
            type: "string",
          },
        },
        model: {
          type: "string",
          enum: ["gpt-3.5-turbo", "gpt-4"],
        }
      }
    }
  }
}

// Types for chitchats
export type ModelName = "gpt-3.5-turbo" | "gpt-4"
export interface Chitchat {
  fullName: string
  mnemonic: string
  description: string
  promptChain: string[]
  model: ModelName
}

