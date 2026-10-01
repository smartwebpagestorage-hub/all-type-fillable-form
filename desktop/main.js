/**
 * सरकारी फॉर्म सेवा (Sarkari Forms Seva)
 * Standalone Windows Desktop Application - Main Process
 * Author: Niraj Kumar, Section Supervisor, RO, Faridabad
 */

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const securityGuard = require('./security-guard');

let mainWindow = null;
let activationWindow = null;

// Ensure single application instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createActivationWindow(initialReason = null) {
  if (activationWindow) {
    activationWindow.focus();
    return;
  }

  activationWindow = new BrowserWindow({
    width: 600,
    height: 720,
    resizable: false,
    maximizable: false,
    minimizable: true,
    center: true,
    title: 'सरकारी फॉर्म सेवा - सॉफ्टवेयर एक्टिवेशन',
    icon: path.join(__dirname, '..', 'image', 'ashok_stambh.svg'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    }
  });

  Menu.setApplicationMenu(null);
  activationWindow.loadFile(path.join(__dirname, 'activation.html'));

  activationWindow.on('closed', () => {
    activationWindow = null;
    // If user closes activation window without activating, exit app
    if (!mainWindow) {
      app.quit();
    }
  });
}

function createMainWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1024,
    minHeight: 720,
    center: true,
    title: 'सरकारी फॉर्म सेवा (100% Offline Desktop Edition)',
    icon: path.join(__dirname, '..', 'image', 'ashok_stambh.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false // Disabled in production to prevent code inspection
    }
  });

  // Remove default menu bar for clean native app appearance
  Menu.setApplicationMenu(null);

  // Load the main offline portal
  const portalPath = path.join(__dirname, '..', 'index.html');
  mainWindow.loadFile(portalPath);

  // =========================================================================
  // Anti-Theft & Security Enforcement: Block Inspection & Code Theft Shortcuts
  // =========================================================================
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (input.key === 'F12' || 
        (input.control && input.shift && (input.key.toLowerCase() === 'i' || input.key.toLowerCase() === 'j')) ||
        (input.control && input.key.toLowerCase() === 'u')) {
      event.preventDefault();
    }
  });

  // Prevent right-click inspect context menu
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Handle window print requests (A4 and Legal single page prints)
  mainWindow.webContents.on('did-finish-load', () => {
    // Check hardware integrity periodically while running
    const check = securityGuard.verifyLicenseOnStartup();
    if (!check.isActivated) {
      dialog.showErrorBox(
        'सुरक्षा चेतावनी / Security Alert',
        check.message || 'अवैध कॉपी का पता चला! सॉफ्टवेयर बंद किया जा रहा है।'
      );
      app.exit(1);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// =========================================================================
// IPC Handlers for Activation
// =========================================================================
ipcMain.handle('get-machine-id', async () => {
  const hw = securityGuard.getMachineHardwareId();
  return { shortId: hw.shortId };
});

ipcMain.handle('submit-activation-password', async (event, password) => {
  const res = securityGuard.activateLicense(password);
  return res;
});

ipcMain.on('launch-main-app', () => {
  if (activationWindow) {
    activationWindow.destroy();
    activationWindow = null;
  }
  createMainWindow();
});

// App lifecycle
app.whenReady().then(() => {
  const licenseCheck = securityGuard.verifyLicenseOnStartup();

  if (licenseCheck.isActivated) {
    createMainWindow();
  } else {
    // Show activation prompt (or error if hardware mismatch)
    createActivationWindow(licenseCheck.reason);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const check = securityGuard.verifyLicenseOnStartup();
      if (check.isActivated) createMainWindow();
      else createActivationWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
