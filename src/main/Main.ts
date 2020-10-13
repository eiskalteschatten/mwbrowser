import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import windowStateKeeper, { State as WindowState } from 'electron-window-state';
import path from 'path';

import './eventsFromRenderer';

import initializeRenderer from './initializeRenderer';

export default class Main {
  static mainWindow: Electron.BrowserWindow | undefined;
  static application: Electron.App;
  static BrowserWindow: typeof BrowserWindow;
  static mainWindowState: WindowState;

  private static onWindowAllClosed(): void {
    if (process.platform !== 'darwin') {
      Main.application.quit();
    }
  }

  private static async onClose(): Promise<void> {
    try {
      if (Main.mainWindow) {
        Main.mainWindow = undefined;
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  private static async onReady(): Promise<void> {
    this.mainWindowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800
    });

    if (process.env.NODE_ENV === 'development') {
      const { default: installExtension, REDUX_DEVTOOLS } = require('electron-devtools-installer');  // eslint-disable-line @typescript-eslint/no-var-requires
      await installExtension(REDUX_DEVTOOLS);
    }

    const browserWindowOptions: BrowserWindowConstructorOptions = {
      width: this.mainWindowState.width,
      height: this.mainWindowState.height,
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
      icon: path.join(__dirname, '../assets/images/icon128.png'),
      webPreferences: {
        nodeIntegration: true
      }
    };

    Main.mainWindow = new Main.BrowserWindow(browserWindowOptions);

    if (Main.mainWindow) {
      if (this.mainWindowState.isMaximized) {
        Main.mainWindow.maximize();
      }

      Main.mainWindow.setFullScreen(this.mainWindowState.isFullScreen || false);

      Main.mainWindow.loadURL(
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : `file://${path.join(__dirname, '../index.html')}`
      );

      this.mainWindowState.manage(Main.mainWindow);

      Main.mainWindow.on('closed', Main.onClose);

      Main.mainWindow.webContents.on('did-finish-load', (): void => {
        if (Main.mainWindow) {
          initializeRenderer(Main.mainWindow);
        }
      });
    }
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow): void {
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('window-all-closed', Main.onWindowAllClosed);
    Main.application.on('ready', Main.onReady);
    Main.application.setName('Spectre Sample Player');
  }
}
