const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 4173;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'content.json');

const sessions = new Map();

function readContent() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeContent(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function isAuthorized(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/content') {
    return sendJson(res, 200, readContent());
  }

  if (req.method === 'POST' && url.pathname === '/api/admin/login') {
    try {
      const { password } = await parseBody(req);
      if (password !== ADMIN_PASSWORD) {
        return sendJson(res, 401, { error: 'Invalid password' });
      }
      const token = crypto.randomBytes(24).toString('hex');
      sessions.set(token, { expiresAt: Date.now() + 1000 * 60 * 60 * 8 });
      return sendJson(res, 200, { token });
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON body' });
    }
  }

  if (req.method === 'PUT' && url.pathname === '/api/admin/content') {
    if (!isAuthorized(req)) return sendJson(res, 401, { error: 'Unauthorized' });
    try {
      const payload = await parseBody(req);
      if (!payload.site || !Array.isArray(payload.leaders)) {
        return sendJson(res, 400, { error: 'Invalid payload' });
      }
      writeContent(payload);
      return sendJson(res, 200, { success: true });
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON body' });
    }
  }

  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (url.pathname === '/admin') filePath = path.join(PUBLIC_DIR, 'admin.html');

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  serveFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`LifeCare app running at http://localhost:${PORT}`);
  console.log('Admin panel: /admin (default password: admin1234)');
});
