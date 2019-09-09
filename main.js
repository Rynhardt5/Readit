const { app, BrowserWindow, ipcMain } = require('electron');
const windowStateKeeper = require('electron-window-state');
const readItem = require('./readItem');

let mainWindow;

ipcMain.on('new-item', (event, itemURL) => {
  readItem(itemURL, item => {
    event.sender.send('new-item-success', item);
  });
});

function createWindow() {
  let state = windowStateKeeper({
    defaultWidth: 500,
    defaultHeight: 650
  });

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 350,
    maxWidth: 650,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('./renderer/main.html');

  state.manage(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
