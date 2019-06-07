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
	});
})
