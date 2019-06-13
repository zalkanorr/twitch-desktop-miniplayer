// Basic init
const electron = require('electron');
const { ipcMain, app, BrowserWindow, Tray, Menu } = electron;

// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(`${__dirname}/app/build`);

// The main interface window
var mainWindow = null;
// The window that contains the stream player
var streamWindow = null;
// The data that will be passed to the streamWindow
var stream_data = null;
// The path of the app's icon
var icon_path = './app/src/assets/icon.png';
// The tray variable
var tray = null;
// The tray menu variable
var tray_context_menu = null;

app.on('ready', () => {
	mainWindow = new BrowserWindow({
		icon: icon_path,
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		},
		sandbox: true
	});

	mainWindow.loadURL(`file://${__dirname}/app/index.html`);

	initializeTray();

	// streamWindowOpen event is emitted when the render process requests to open a new stream window.
	// In the event, the data required for the stream window is included and then stored in the stream_data variable.
	ipcMain.on('streamWindowOpen', function (e, data) {
		console.log('streamWindowOpen');
		streamWindow = new BrowserWindow({
			width: 384,
			height: 216,
			toolbar: false,
			frame: false,
			webPreferences: {
				nodeIntegration: true
			},
			sandbox: true
		});

		// Forcing the window to be ontop
		streamWindow.setAlwaysOnTop(true, 'floating');
		streamWindow.setVisibleOnAllWorkspaces(true);
		streamWindow.setFullScreenable(false);

		streamWindow.loadURL(`file://${__dirname}/app/index.html#/stream-window`);

		// Store data
		stream_data = data;

		// Make tray menu item visible
		tray_context_menu.getMenuItemById('close-stream').visible = true;
	});

	// streamWindowSendMeData event is emmited when the streamWindow is created and is ready to get the data required.
	ipcMain.on('streamWindowSendMeData', () => {
		console.log('streamWindowSendMeData');
		// Send main window to tray
		mainWindow.hide();
		// Send the stream data to the main window
		streamWindow.webContents.send('streamData', stream_data);
	});

	// streamWindowSendMeData event is emmited when the streamWindow requests to close.
	ipcMain.on('streamWindowClose', () => {
		console.log('streamWindowClose');
		// Close stream window
		streamWindow.close();
		// Make tray menu item not visible
		tray_context_menu.getMenuItemById('close-stream').visible = false;
		// Send Stop Playing event at main window
		mainWindow.webContents.send('stopPlaying');
	});

	function initializeTray() {
		tray = new Tray(icon_path);
		tray_context_menu = Menu.buildFromTemplate([
			{
				label: 'Open menu',
				click: function () {
					mainWindow.show();
				}
			},
			{
				label: 'Close stream',
				id: 'close-stream',
				visible: false,
				click: function () {
					ipcMain.emit('streamWindowClose');
				}
			},
			{
				label: 'Quit',
				click: function () {
					app.exit();
				}
			}
		]);

		tray.setToolTip('Twitch Desktop Miniplayer');
		tray.setContextMenu(tray_context_menu);

		tray.on('click', () => {
			mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
		});

		mainWindow.on('show', () => {
			tray.setHighlightMode('always');
		});

		mainWindow.on('hide', () => {
			tray.setHighlightMode('always');
		});

		mainWindow.on('close', function (event) {
			// Making sure that close event is not emitted by app.quit()
			if (!app.isQuiting) {
				event.preventDefault();
				mainWindow.hide();
			}
			return false;
		});
	}
});
