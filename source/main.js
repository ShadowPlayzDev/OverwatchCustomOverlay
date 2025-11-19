const { app, BrowserWindow, Tray, Menu, ipcMain, shell, screen } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let tray;
let activeSkin = null;
const cachedSkins = [];

const appDataPath = process.env.APPDATA;
const userDataPath = path.join(appDataPath, 'ow-custom-overlay');
const configPath = path.join(userDataPath, 'config.json');
const skinsPath = path.join(userDataPath, 'skins');

const DEFAULT_CONFIG = {
  width: 300,
  height: 300,
  offsetX: 0,
  offsetY: 0,
  alwaysOnTop: true,
  clickThrough: true,
  transparent: true,
  frame: false,
  devMode: false
};

function readJSONSafe(file) { try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return null; } }
function writeJSONSafe(file,obj){ try{ fs.writeFileSync(file, JSON.stringify(obj,null,2),'utf8'); } catch{} }

function ensureUserFolders(){
  if(!fs.existsSync(skinsPath)) fs.mkdirSync(skinsPath,{recursive:true});
  if(!fs.existsSync(configPath)) writeJSONSafe(configPath,DEFAULT_CONFIG);
}

function scanSkins(){
  cachedSkins.length=0;
  if(!fs.existsSync(skinsPath)) return;
  const folders=fs.readdirSync(skinsPath).filter(f=>fs.statSync(path.join(skinsPath,f)).isDirectory());
  for(const folder of folders){
    const skinJsonPath=path.join(skinsPath,folder,'skin.json');
    let skinData={name:folder,image:'preview.png'};
    if(fs.existsSync(skinJsonPath)) skinData={...skinData,...readJSONSafe(skinJsonPath)};
    cachedSkins.push({folder,name:skinData.name,imagePath:path.join(skinsPath,folder,skinData.image)});
  }
  if(!activeSkin && cachedSkins.length) activeSkin=cachedSkins[0];
}

function getActiveSkin(){ return activeSkin; }
function setActiveSkin(folder){ const skin=cachedSkins.find(s=>s.folder===folder); if(skin) activeSkin=skin; }

function createWindow(cfg){
  const display=screen.getPrimaryDisplay();
  mainWindow=new BrowserWindow({
    x:cfg.offsetX,
    y:cfg.offsetY,
    width:cfg.width,
    height:cfg.height,
    frame:cfg.frame,
    transparent:cfg.transparent,
    skipTaskbar:true,
    resizable:false,
    movable:false,
    hasShadow:false,
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true}
  });
  mainWindow.setBounds({x:0,y:0,width:display.size.width,height:display.size.height});
  if(cfg.clickThrough) mainWindow.setIgnoreMouseEvents(true,{forward:true});
  if(cfg.alwaysOnTop) mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.loadFile('render.html');
  mainWindow.webContents.on('did-finish-load',()=>{ if(activeSkin) mainWindow.webContents.send('load-skin',activeSkin.imagePath); });
}

function openDevWindow(cfg){
  if(!cfg.devMode) return;
  const devWindow=new BrowserWindow({width:600,height:400,alwaysOnTop:true,webPreferences:{nodeIntegration:false,contextIsolation:false}});
  const html=`<h2>Overlay Dev Info</h2>
  <p><b>Config:</b> ${JSON.stringify(cfg)}</p>
  <p><b>Active Skin:</b> ${activeSkin?JSON.stringify(activeSkin):'none'}</p>
  <p><b>All Skins:</b> ${JSON.stringify(cachedSkins)}</p>`;
  devWindow.loadURL('data:text/html,'+encodeURIComponent(html));
}

function buildTrayMenu(){
  const cfg=readJSONSafe(configPath)||DEFAULT_CONFIG;
  const skinsItems=cachedSkins.map(s=>({
    label:`${activeSkin?.folder===s.folder?'[X] ':'[ ] '}${s.name}`,
    click:()=>{ setActiveSkin(s.folder); if(mainWindow&&!mainWindow.isDestroyed()) mainWindow.webContents.send('load-skin',activeSkin.imagePath); buildAndSetMenu(); }
  }));
  const settingsSubmenu=[
    { label:`Always On Top: ${cfg.alwaysOnTop?'ON':'OFF'}`, click:()=>{ cfg.alwaysOnTop=!cfg.alwaysOnTop; mainWindow.setAlwaysOnTop(cfg.alwaysOnTop); writeJSONSafe(configPath,cfg); buildAndSetMenu(); } },
    { label:`Click-through: ${cfg.clickThrough?'ON':'OFF'}`, click:()=>{ cfg.clickThrough=!cfg.clickThrough; mainWindow.setIgnoreMouseEvents(cfg.clickThrough,{forward:true}); writeJSONSafe(configPath,cfg); buildAndSetMenu(); } },
    { label:`Frameless: ${cfg.frame?'OFF':'ON'}`, click:()=>{ cfg.frame=!cfg.frame; writeJSONSafe(configPath,cfg); mainWindow.close(); createWindow(cfg); buildAndSetMenu(); } },
    { label:`Transparent: ${cfg.transparent?'ON':'OFF'}`, click:()=>{ cfg.transparent=!cfg.transparent; writeJSONSafe(configPath,cfg); mainWindow.close(); createWindow(cfg); buildAndSetMenu(); } },
    { label:'Open config.json', click:()=>shell.openPath(configPath) }
  ];
  let packageInfo={version:'unknown',author:'ShadowPlayzDev on GH'};
  try{ const pkg=readJSONSafe(path.join(__dirname,'package.json')); if(pkg){ packageInfo.version=pkg.version||packageInfo.version; packageInfo.author=pkg.author||packageInfo.author; } } catch{}
  const template=[
    { label:'Settings',submenu:settingsSubmenu },
    { label:'Skins',submenu:skinsItems.length?skinsItems:[{label:'No skins found',enabled:false}] },
    { type:'separator' },
    { label:`version: ${packageInfo.version}`,enabled:false },
    { label:`author: ${packageInfo.author}`,enabled:false },
    { type:'separator' },
    { label:'Force Close App',click:()=>app.exit(0) }
  ];
  tray.setContextMenu(Menu.buildFromTemplate(template));
}

function buildAndSetMenu(){ buildTrayMenu(); }

app.whenReady().then(()=>{
  ensureUserFolders();
  scanSkins();
  const cfg=readJSONSafe(configPath)||DEFAULT_CONFIG;
  createWindow(cfg);
  openDevWindow(cfg);
  tray=new Tray(path.join(__dirname,'app.png'));
  tray.setToolTip('Overlay UI');
  buildAndSetMenu();
  tray.on('click',()=>tray.popUpContextMenu());
});

ipcMain.on('request-skins-rescan',()=>{ scanSkins(); buildAndSetMenu(); });
app.on('window-all-closed',e=>e.preventDefault());
