export const serviceTempInputFile = "/tmp/tomato-service-input.txt";
export const serviceTempOutputFile = "/tmp/tomato-service-output.txt";
import { BrowserWindow, ipcMain } from "electron";
import fs from "fs";
import { ServiceInvocationCanceledSentinel } from "../shared/constants";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function monitorServiceInputFile() {
  while (true) {
    try {
      if (!fs.existsSync(serviceTempInputFile)) {
        await delay(100);
        continue;
      }
      const input = fs.readFileSync(serviceTempInputFile, "utf8");
      console.log("Got service input", input);
      fs.unlinkSync(serviceTempInputFile);
      const result = await sendServiceInput(input);
      if (result == ServiceInvocationCanceledSentinel) {
        // Just echo the input if canceled so no change happens
        fs.writeFileSync(serviceTempOutputFile, input);
      } else {
        fs.writeFileSync(serviceTempOutputFile, result);
      }
    } catch (e) {
      console.error("Error handling service input", e);
    }
  }
}

async function sendServiceInput(input: string): Promise<string> {
  // Send the input to the service
  const mainWindow = BrowserWindow.getAllWindows()[0];
  mainWindow.webContents.send("service-input", input);
  // Listen for the response from the service
  return new Promise((resolve) => {
    ipcMain.once("service-output", (_, output) => {
      resolve(output);
    });
  });
}
