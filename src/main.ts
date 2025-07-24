import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';

class TimezoneConverterApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch('disable-gpu');
    app.commandLine.appendSwitch('disable-gpu-process');
    app.commandLine.appendSwitch('disable-gpu-compositing');
    app.commandLine.appendSwitch('disable-gpu-rasterization');
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('disable-software-rasterizer');
    
    app.whenReady().then(() => {
      this.createWindow();
      this.createTray();
      this.registerGlobalShortcuts();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        allowRunningInsecureContent: true
      },
      show: true,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    this.mainWindow.on('blur', () => {
      if (this.mainWindow) {
        this.mainWindow.hide();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private createTray(): void {
    // Create a simple tray icon programmatically for cross-platform compatibility
    const icon = nativeImage.createEmpty();
    this.tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Timezone Converter',
        click: () => this.toggleWindow()
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setToolTip('Timezone Converter');
    this.tray.setContextMenu(contextMenu);
    
    this.tray.on('click', () => {
      this.toggleWindow();
    });
  }

  private registerGlobalShortcuts(): void {
    globalShortcut.register('CommandOrControl+Shift+T', () => {
      this.toggleWindow();
    });
  }

  private toggleWindow(): void {
    if (!this.mainWindow) {
      this.createWindow();
      return;
    }

    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }
}

new TimezoneConverterApp();