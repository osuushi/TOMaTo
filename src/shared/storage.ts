// Schema for a shortcut

import { Schema } from "electron-store"

export const schema: Schema<any> = {
  openAiAPIKey: {
    type: 'string',
    default: '',
  },
  shortcuts: {
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

// Types for shortcuts
export type ModelName = "gpt-3.5-turbo" | "gpt-4"
export interface Shortcut {
  fullName: string
  mnemonic: string
  description: string
  promptChain: string[]
  model: ModelName
}

