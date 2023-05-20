import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  clipboard,
} from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import Store from "electron-store";
import { View } from "../shared/views";
import { monitorServiceInputFile } from "./service";
import { spawnSync, spawn } from "child_process";
import { runCalculation } from "./calculator";
import Prism from "prismjs";
import { writeFile, readFile } from "fs/promises";
import prismCssPath from "../../resources/prism.css.txt?asset&asarUnpack";

Store.initRenderer();
const store = new Store();
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    closable: process.platform !== "darwin",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // When the app comes to the foreground, send it to the renderer process
  app.on("browser-window-focus", () => {
    mainWindow.webContents.send("activate");
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    BrowserWindow.getAllWindows()[0].show();
  });

  updateGlobalShortcuts();

  if (store.get("hideDockIcon") as boolean) app.dock.hide();
  // Monitor the input file for the service
  monitorServiceInputFile().catch((e) => {
    console.error("Error monitoring service input file", e);
  });
});

function updateGlobalShortcuts() {
  globalShortcut.unregisterAll();
  const shortcut = store.get("activationShortcut") as string | undefined;
  if (shortcut) {
    const ret = globalShortcut.register(shortcut, () => {
      // Bring app to front
      BrowserWindow.getAllWindows()[0].show();
    });
    if (!ret) {
      console.log("registration failed");
    }
  }

  const devToolsShortcut = globalShortcut.register(
    "CommandOrControl+Shift+I",
    () => {
      BrowserWindow.getFocusedWindow()?.webContents.toggleDevTools();
    }
  );
  if (!devToolsShortcut) {
    console.log("registration failed");
  }
}

ipcMain.on("update-activation-shortcut", () => {
  updateGlobalShortcuts();
});

ipcMain.on("update-hide-dock-icon", () => {
  if (store.get("hideDockIcon") as boolean) app.dock.hide();
  else app.dock.show();
});

app.on("will-quit", () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("hide", () => {
  // If on macos hide the app, otherwise, minimize
  if (process.platform === "darwin") {
    app.hide();
  } else {
    BrowserWindow.getFocusedWindow()?.minimize();
  }
});

ipcMain.on("copy", (_, text) => {
  clipboard.writeText(text);
});

app.on("before-quit", () => {
  // Quit the application
  app.exit();
});

let currentView: View = View.Search;
ipcMain.on("set-view", (_, view) => {
  currentView = view;
});

ipcMain.on("open-workflows", () => {
  const resourcePath = process.resourcesPath;
  // shell.openPath doesn't work for this bundle directory, so we'll shell out instead with bash
  const workflowsPath = [join(resourcePath, "workflows")];
  console.log("Opening workflows directory", workflowsPath);
  spawnSync("open", workflowsPath);
});

ipcMain.handle("run-calculation", async (_, code): Promise<string> => {
  return await runCalculation(code);
});

ipcMain.handle("dump-js", async (_, code): Promise<void> => {
  const htmlSnippet: string = Prism.highlight(
    code,
    Prism.languages.javascript,
    "javascript"
  );
  // Load the css and put it inline
  const css = await readFile(prismCssPath, "utf8");
  const html = `
    <html>
      <head>
        <style>
          ${css}
        </style>
      </head>
      <body>
        <pre>${htmlSnippet}</pre>
      </body>
    </html>
  `;

  // Temp file
  const tempFile = `/tmp/tomato-dump-js-${Date.now()}.html`;
  // Write the file
  await writeFile(tempFile, html);
  // Open the file with qlmanage
  spawn("qlmanage", ["-p", tempFile]);
});

// Polling loop to hide the window if the app is not active
const HIDE_VIEWS = [View.Search, View.Calculator];
setInterval(() => {
  if (!HIDE_VIEWS.includes(currentView)) return;

  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.hide();
  }
}, 100);
