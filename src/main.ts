import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage, ipcMain } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

class TimezoneConverterApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private currentKeybind: string = 'CommandOrControl+Shift+T';
  private settingsPath: string;

  constructor() {
    this.settingsPath = require('path').join(os.homedir(), '.timezone-converter-settings.json');
    this.loadSettings();
    this.init();
  }

  private loadSettings(): void {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
        if (settings.keybinds?.toggle) {
          this.currentKeybind = settings.keybinds.toggle;
        }
      }
    } catch (error) {
      // Use default keybind if settings can't be loaded
    }
  }

  private saveSettings(settings: any): void {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
      // Settings save failed, but continue
    }
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
      this.setupIPC();
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
    globalShortcut.register(this.currentKeybind, () => {
      this.toggleWindow();
    });
  }

  private setupIPC(): void {
    ipcMain.on('update-keybind', (event, newKeybind: string) => {
      console.log('Main process received keybind:', newKeybind);
      
      // Validate keybind format - must contain at least modifier+key
      if (!newKeybind || typeof newKeybind !== 'string' || !newKeybind.includes('+')) {
        console.error('Invalid keybind format (no plus sign):', newKeybind);
        event.reply('keybind-updated', { keybind: newKeybind, success: false, error: 'Invalid keybind format' });
        return;
      }
      
      const parts = newKeybind.split('+');
      const modifiers = parts.filter(p => ['CommandOrControl', 'Shift', 'Alt', 'Ctrl', 'Cmd'].includes(p));
      const regularKeys = parts.filter(p => !['CommandOrControl', 'Shift', 'Alt', 'Ctrl', 'Cmd'].includes(p));
      
      if (parts.length < 2 || modifiers.length === 0 || regularKeys.length === 0) {
        console.error('Invalid keybind format (missing modifier or key):', newKeybind, 'Parts:', parts);
        event.reply('keybind-updated', { keybind: newKeybind, success: false, error: 'Keybind must have modifier and key' });
        return;
      }
      
      try {
        // Unregister old keybind
        globalShortcut.unregister(this.currentKeybind);
        
        // Register new keybind
        this.currentKeybind = newKeybind;
        const success = globalShortcut.register(this.currentKeybind, () => {
          this.toggleWindow();
        });
        
        if (success) {
          // Save to persistent settings
          const settings = { keybinds: { toggle: newKeybind } };
          this.saveSettings(settings);
        }
        
        // Send confirmation back to renderer
        event.reply('keybind-updated', { keybind: newKeybind, success });
      } catch (error) {
        console.error('Error updating keybind:', error);
        event.reply('keybind-updated', { keybind: newKeybind, success: false, error: String(error) });
      }
    });

    ipcMain.on('get-current-keybind', (event) => {
      event.reply('current-keybind', this.currentKeybind);
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