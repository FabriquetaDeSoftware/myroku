import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 4000;
const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'browser');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function resolveSafe(urlPath) {
  const target = normalize(join(ROOT, decodeURIComponent(urlPath)));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  return target;
}

async function send(res, path) {
  const data = await readFile(path);
  res.writeHead(200, {
    'Content-Type': TYPES[extname(path).toLowerCase()] || 'application/octet-stream',
  });
  res.end(data);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const target = resolveSafe(url.pathname);
    if (!target) return res.writeHead(403).end();
    try {
      const s = await stat(target);
      if (s.isDirectory()) return await send(res, join(target, 'index.html'));
      return await send(res, target);
    } catch {
      return await send(res, join(ROOT, 'index.html'));
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500).end();
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`UI listening on :${PORT}`);
});
