
const { app, BrowserWindow } = require('electron');
const Main = require('../build/Main').default;

Main.main(app, BrowserWindow);
