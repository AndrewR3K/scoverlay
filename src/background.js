'use strict'

import { app, globalShortcut, protocol, BrowserWindow, BrowserView, screen, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from "path"
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from "electron-updater"

const isDevelopment = process.env.NODE_ENV !== 'production'
let win;
autoUpdater.autoDownload = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  let pos = {
    x: 0,
    y: 0
  }
  let display = screen.getPrimaryDisplay();
  let screenWidth = display.bounds.width;
  let appWidth = 200
  let appHeight = 56

  let currentWidth = appWidth
  let currentHeight = appHeight

  pos.x = screenWidth - appWidth

  // Create the browser window.
  win = new BrowserWindow({
    icon: path.join(__static, "icons/logo@64.png"),
    width: appWidth,
    minWidth: appWidth / 2,
    height: appHeight,
    x: pos.x,
    y: 0,
    frame: false,
    fullscreenable: false,
    transparent: true,
    title: "SC Overlay",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: false
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdater.checkForUpdatesAndNotify()
  }

  win.setMenuBarVisibility(false)
  win.setResizable(false)
  win.setAlwaysOnTop(true, 'screen');

  win.on('move', (event) => {
    let p = win.getPosition()
    pos.x = p[0]
    pos.y = p[1]
  })


  // Global key capture not working when focused into sC
  // let toggle = false
  // globalShortcut.register('Shift+Tab', () => {
  //   toggle = !toggle
  //   if (toggle) {
  //     win.hide()
  //   } else {
  //     win.show()
  //   }
  // })

  ipcMain.on('resize-window', (event, arg) => {
    // toggle resizable to work around current Electorn bug
    win.setResizable(true)
    win.setSize(arg && arg.width ? arg.width : appWidth, arg && arg.height ? arg.height : appHeight, true)
    win.setResizable(false)

    currentWidth = arg && arg.width ? arg.width : appWidth
    currentHeight = arg && arg.height ? arg.height : appHeight
  })

  ipcMain.on('open-window', (event, arg) => {
    const view = new BrowserView()
    win.setBrowserView(view)
    view.setBounds({ x: 0, y: 60, width: currentWidth, height: currentHeight - 60 })
    view.webContents.loadURL(arg.src)
  })
}

ipcMain.on('app_version', (event) => {
  if (!process.env.WEBPACK_DEV_SERVER_URL) {
    autoUpdater.checkForUpdatesAndNotify()
    event.sender.send('app_version', { version: app.getVersion() });
  }
});

autoUpdater.on('update-available', () => {
  // mainWindow.webContents.send('update_available');
  log.error('Update available')
  autoUpdater.downloadUpdate()
});

autoUpdater.on('update-downloaded', () => {
  // mainWindow.webContents.send('update_downloaded');
  log.error('Downloaded')
});

autoUpdater.on('checking-for-update', () => {
  log.error('Checking for update')
})

autoUpdater.on('update-not-available', (ev, info) => {
  log.error('Checking ... update not available')
})

autoUpdater.on('download-progress', (ev, progressObj) => {
  log.error('Download progress')
  // let log_message = "Download speed: " + progressObj.bytesPerSecond;
  // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  // log.error(log_message)

  // sendStatusToWindow(log_message);
  // Commented because it says undefined
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0 && win === null) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
