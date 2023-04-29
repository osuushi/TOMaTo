import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    storeGet: (key: string) => any;
    storeSet: (key: string, value: any) => void;
  }

  var electron: ElectronAPI;
}

export default global;
