const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('overlayAPI', {
onSkinLoad: (cb) => ipcRenderer.on('load-skin', (event, imgPath) => cb(imgPath))
});