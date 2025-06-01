const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

function createWindow () {
  const preloadPath = path.join(__dirname, 'preload.js');
  const webPreferences = {
    nodeIntegration: false, // Recommended for security
   contextIsolation: true, // Recommended for security
 };
 if (fs.existsSync(preloadPath)) {
   webPreferences.preload = preloadPath; // Include preload script if it exists
 }

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences
  });

  // Load the Next.js app
  // Assumes Next.js exports to the 'out' directory
  const startUrl = url.format({
    pathname: path.join(__dirname, '../out/index.html'),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    // Dereference the window object
    // For multi-window apps, you would store windows in an array.
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  // On macOS, applications and their menu bar stay active until the user quits explicitly with Cmd + Q
  // On other platforms, quit directly.
  if (process.platform !== 'darwin') app.quit();
});

// Optional: Create a preload script `electron/preload.js`
// This script runs in a privileged environment and can expose Node.js APIs to the renderer process securely.
// For now, create an empty file if it's referenced, or adjust main.js if not using one.
