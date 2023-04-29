import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import Store from "electron-store";
import { schema } from "../shared/storage";

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    console.time("store");
    const store = new Store({ schema });
    console.timeEnd("store");
    contextBridge.exposeInMainWorld("storeGet", store.get.bind(store));
    contextBridge.exposeInMainWorld("storeSet", store.set.bind(store));
    console.timeEnd("store");
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.storeGet = () => {};
  // @ts-ignore (define in dts)
  window.storeSet = () => {};
  // @ts-ignore (define in dts)
  window.api = api;
}
