// Basic init
const electron = require('electron')
const {ipcMain, app, BrowserWindow} = electron

// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname)

// To avoid being garbage collected
let mainWindow
var streamWindow = null;
var stream_data = null;
app.on('ready', () => {

	let mainWindow = new BrowserWindow({
		width: 800,
		height: 600
	})

	mainWindow.loadURL(`file://${__dirname}/app/index.html`)

	ipcMain.on('streamWindowOpen', function (e, data) {
		console.log('streamWindowOpen');
		streamWindow = new BrowserWindow({width: 400, height: 200, toolbar: false, frame: false});
		streamWindow.setAlwaysOnTop(true, "floating");
		streamWindow.setVisibleOnAllWorkspaces(true);
		streamWindow.setFullScreenable(false);
		streamWindow.loadURL(`file://${__dirname}/app/index.html#/stream-window`);
		stream_data = data;
	});
	ipcMain.on('streamWindowSendMeData', function (e, data) {
		console.log('streamWindowSendMeData');
		streamWindow.webContents.send('streamData', stream_data);
	});
	ipcMain.on('streamWindowClose', function (e, data) {
		console.log('streamWindowClose');
		streamWindow.close();
	});
})
