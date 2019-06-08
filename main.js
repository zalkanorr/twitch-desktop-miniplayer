// Basic init
const electron = require('electron');
const { ipcMain, app, BrowserWindow } = electron;

// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname);

// The main interface window
let mainWindow = null;
// The window that contains the stream player
var streamWindow = null;
// The data that will be passed to the streamWindow
var stream_data = null;

app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);

  // streamWindowOpen event is emitted when the render process requests to open a new stream window.
  // In the event, the data required for the stream window is included and then stored in the stream_data variable.
  ipcMain.on('streamWindowOpen', function(e, data) {
    console.log('streamWindowOpen');
    streamWindow = new BrowserWindow({
      width: 400,
      height: 200,
      toolbar: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    // Forcing the window to be ontop
    streamWindow.setAlwaysOnTop(true, 'floating');
    streamWindow.setVisibleOnAllWorkspaces(true);
    streamWindow.setFullScreenable(false);

    streamWindow.loadURL(`file://${__dirname}/app/index.html#/stream-window`);

    // Store data
    stream_data = data;
  });

  // streamWindowSendMeData event is emmited when the streamWindow is created and is ready to get the data required.
  ipcMain.on('streamWindowSendMeData', () => {
    console.log('streamWindowSendMeData');
    streamWindow.webContents.send('streamData', stream_data);
  });

  // streamWindowSendMeData event is emmited when the streamWindow requests to close.
  ipcMain.on('streamWindowClose', () => {
    console.log('streamWindowClose');
    streamWindow.close();
  });
});
