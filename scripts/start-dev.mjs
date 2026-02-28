import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');

const rawApiBase = process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const apiBase = rawApiBase.replace(/\/$/, '');
const healthUrl = apiBase.endsWith('/api') ? `${apiBase}/health` : `${apiBase}/api/health`;

const isWindows = process.platform === 'win32';

let backendProcess = null;
let frontendProcess = null;
let shuttingDown = false;

async function isServerHealthy() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function spawnNpmDev(cwd, name) {
  const child = spawn('npm run dev', {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('error', (error) => {
    console.error(`[${name}] failed to start:`, error.message);
  });

  return child;
}

async function waitForServerReady(timeoutMs = 60000, intervalMs = 1500) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerHealthy()) return true;
    await delay(intervalMs);
  }

  return false;
}

function killProcessTree(child) {
  if (!child || child.killed || child.exitCode !== null) return;

  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      shell: false,
    });
    return;
  }

  child.kill('SIGTERM');
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  killProcessTree(frontendProcess);
  killProcessTree(backendProcess);

  setTimeout(() => process.exit(code), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

(async () => {
  const alreadyRunning = await isServerHealthy();

  if (alreadyRunning) {
    console.log(`Backend already running at ${healthUrl}`);
  } else {
    console.log('Starting backend server...');
    backendProcess = spawnNpmDev(serverDir, 'backend');

    backendProcess.on('exit', (code) => {
      if (!shuttingDown && !frontendProcess) {
        console.error(`Backend exited early with code ${code ?? 'unknown'}.`);
        shutdown(code ?? 1);
      }
    });

    const backendReady = await waitForServerReady();
    if (!backendReady) {
      console.error('Backend did not become ready in time.');
      shutdown(1);
      return;
    }

    console.log('Backend is healthy.');
  }

  console.log('Starting frontend...');
  frontendProcess = spawn('npm run frontend:dev', {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  frontendProcess.on('exit', (code) => {
    if (!shuttingDown) {
      shutdown(code ?? 0);
    }
  });
})();
