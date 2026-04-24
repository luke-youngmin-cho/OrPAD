import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { _electron as electron, ElectronApplication } from 'playwright';

export async function launchElectron(extraArgs: string[] = []): Promise<ElectronApplication> {
  return electron.launch({
    args: ['.', ...extraArgs],
    cwd: process.cwd(),
  });
}

export async function startStaticServer(
  rootDir: string,
): Promise<{ url: string; close: () => Promise<void> }> {
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
    '.woff2': 'font/woff2',
    '.ico':  'image/x-icon',
  };

  const server = http.createServer((req, res) => {
    const urlPath = (req.url ?? '/').replace(/\?.*$/, '');
    const filePath = path.join(rootDir, urlPath === '/' ? 'index.html' : urlPath);
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'application/octet-stream' });
      res.end(data);
    });
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;

  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise(resolve => server.close(() => resolve())),
  };
}
