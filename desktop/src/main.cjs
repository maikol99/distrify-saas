const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

let mainWindow = null;
let backendProcess = null;
let mongoProcess = null;

// Evitar múltiples instancias de la aplicación
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Directorios de datos del usuario
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'data');
const uploadsPath = path.join(userDataPath, 'uploads');

if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

// Comprobar si un puerto está abierto
function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

// Iniciar MongoDB si existe binario portable y el puerto no está activo
async function startDatabase() {
  const mongoRunning = await isPortOpen(27017);
  if (mongoRunning) {
    console.log('[Alevia Desktop] MongoDB ya está corriendo en el puerto 27017.');
    return;
  }

  // Buscar mongod en posibles rutas (desarrollo o paquete)
  const candidateMongod = [
    path.join(process.resourcesPath || '', 'bin', 'mongod.exe'),
    path.join(process.resourcesPath || '', 'bin', 'mongod'),
    path.join(__dirname, '..', 'bin', 'mongod.exe'),
    path.join(__dirname, '..', 'bin', 'mongod'),
  ];

  const mongodBinary = candidateMongod.find((p) => fs.existsSync(p));
  if (mongodBinary) {
    console.log(`[Alevia Desktop] Iniciando MongoDB portable desde ${mongodBinary}`);
    mongoProcess = spawn(mongodBinary, [
      '--dbpath', dbPath,
      '--port', '27017',
      '--bind_ip', '127.0.0.1',
    ], { stdio: 'ignore' });

    mongoProcess.on('error', (err) => {
      console.error('[Alevia Desktop] Error al iniciar MongoDB:', err);
    });
  } else {
    console.log('[Alevia Desktop] No se encontró mongod portable, intentando usar servicio MongoDB del sistema...');
  }
}

// Iniciar el backend NestJS
function startBackend() {
  const isDev = !app.isPackaged;
  const backDist = isDev
    ? path.join(__dirname, '..', '..', 'back', 'dist', 'main.js')
    : path.join(process.resourcesPath, 'back-dist', 'main.js');

  const frontDist = isDev
    ? path.join(__dirname, '..', '..', 'front', 'dist')
    : path.join(process.resourcesPath, 'front-dist');

  const nodeModulesPath = isDev
    ? path.join(__dirname, '..', '..', 'back', 'node_modules')
    : path.join(process.resourcesPath, 'back-node_modules');

  const env = {
    ...process.env,
    DESKTOP_MODE: 'true',
    PORT: '3000',
    NODE_ENV: 'production',
    MONGO_DB_URI: 'mongodb://127.0.0.1:27017',
    MONGO_DB_NAME: 'alevia_desktop',
    JWT_SECRET: 'alevia_desktop_offline_jwt_secret_key_2026',
    ENCRYPTION_KEY: 'alevia_desktop_enc_key_32chars!',
    FRONTEND_URL: 'http://localhost:3000',
    FRONT_DIST_PATH: frontDist,
    NODE_PATH: nodeModulesPath,
  };

  const nodeBinary = process.execPath; // Usa el Node integrado en Electron
  backendProcess = spawn(process.platform === 'win32' ? 'node.exe' : 'node', [backDist], {
    env,
    cwd: path.dirname(backDist),
    stdio: 'inherit',
  });

  backendProcess.on('error', (err) => {
    console.error('[Alevia Desktop] Error en el proceso de backend:', err);
    dialog.showErrorBox(
      'Error de inicio',
      `No se pudo iniciar el servidor local de Alevia Pay: ${err.message}`
    );
  });
}

// Esperar a que el servidor responda en /health
function waitForServer(timeoutMs = 40000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get('http://127.0.0.1:3000/health', (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          retry();
        }
      });

      req.on('error', () => {
        retry();
      });

      req.setTimeout(800, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error('Tiempo de espera agotado al iniciar Alevia Pay.'));
      } else {
        setTimeout(check, 400);
      }
    };

    check();
  });
}

// Crear la ventana principal de Alevia Pay
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 650,
    title: 'Alevia Pay - Punto de Venta',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.maximize();
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ventana de carga inicial mientras levantan los servicios
function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 480,
    height: 320,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    backgroundColor: '#ffffff',
  });

  const splashHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: #ffffff;
          color: #1f2937;
          user-select: none;
        }
        .logo {
          font-size: 32px;
          font-weight: 800;
          color: #f9931e;
          margin-bottom: 8px;
        }
        .tagline {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 24px;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #f9931e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .status {
          margin-top: 16px;
          font-size: 12px;
          color: #9ca3af;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="logo">Alevia Pay</div>
      <div class="tagline">Punto de Venta y Gestión Comercial</div>
      <div class="spinner"></div>
      <div class="status">Iniciando sistema local...</div>
    </body>
    </html>
  `;

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
  return splash;
}

app.whenReady().then(async () => {
  const splash = createSplashWindow();

  try {
    await startDatabase();
    startBackend();
    await waitForServer();

    createMainWindow();
    splash.close();
  } catch (error) {
    splash.close();
    dialog.showErrorBox(
      'Error de inicio',
      `No se pudo iniciar Alevia Pay: ${error.message}\nVerifique que MongoDB esté en ejecución.`
    );
    app.quit();
  }
});

// Limpieza de procesos hijos al cerrar la aplicación
function cleanupProcesses() {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (_) {}
    backendProcess = null;
  }
  if (mongoProcess) {
    try {
      mongoProcess.kill();
    } catch (_) {}
    mongoProcess = null;
  }
}

app.on('before-quit', cleanupProcesses);

app.on('window-all-closed', () => {
  cleanupProcesses();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
