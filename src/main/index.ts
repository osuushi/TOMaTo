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
import icon from "../../resources/icon.png?asset";
import Store from "electron-store";
import { View } from "../shared/views";

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
    ...(process.platform === "linux" ? { icon } : {}),
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

// Polling loop to hide the window if the app is not active
setInterval(() => {
  if (currentView !== View.Search) return;

  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.hide();
  }
}, 100);
