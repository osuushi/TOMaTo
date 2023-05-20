// Schema for a settings

import { Schema } from "electron-store";

export const schema: Schema<any> = {
  activationShortcut: {
    type: "string",
    default: "",
  },
  hideDockIcon: {
    type: "boolean",
    default: false,
  },
  openAiAPIKey: {
    type: "string",
    default: "",
  },
  calculatorModel: {
    type: "string",
    enum: ["gpt-3.5-turbo", "gpt-4"],
    default: "gpt-3.5-turbo",
  },
  chitchats: {
    type: "array",
    items: {
      type: "object",
      properties: {
        uuid: { type: "string" },
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
        },
      },
    },
  },
};

// Types for chitchats
export enum ModelName {
  Gpt35Turbo = "gpt-3.5-turbo",
  Gpt4 = "gpt-4",
}

export interface Chitchat {
  uuid: string;
  fullName: string;
  mnemonic: string;
  description: string;
  promptChain: string[];
  model: ModelName;
}
