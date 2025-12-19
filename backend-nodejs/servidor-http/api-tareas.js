const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

/* ================== CONFIG ================== */
const PORT = 3000;
const API_KEYS = ['mi-api-key-123'];

/* ================== DATA ================== */
let tareas = [
  { id: 1, titulo: 'Aprender Node', completada: false, prioridad: 'alta', fecha: '2024-01-01' },
  { id: 2, titulo: 'Practicar HTTP', completada: true, prioridad: 'media', fecha: '2024-01-02' }
];
let nextId = 3;

/* ================== HELPERS ================== */
function json(res, data, code = 200) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,x-api-key'
  });
  res.end(JSON.stringify(data, null, 2));
}

function auth(req, res) {
  const key = req.headers['x-api-key'];
  if (!API_KEYS.includes(key)) {
    json(res, { error: 'Unauthorized' }, 401);
    return false;
  }
  return true;
}

/* ================== STATS ================== */
function statsPorPrioridad() {
  return tareas.reduce((acc, t) => {
    acc[t.prioridad] = (acc[t.prioridad] || 0) + 1;
    return acc;
  }, {});
}

function statsCompletadasPorDia() {
  const out = {};
  tareas.filter(t => t.completada).forEach(t => {
    out[t.fecha] = (out[t.fecha] || 0) + 1;
  });
  return out;
}

/* ================== SERVER ================== */
const server = http.createServer((req, res) => {
  const { method } = req;
  const parsed = url.parse(req.url, true);
  const { pathname } = parsed;

  /* ---------- STATIC FILES ---------- */
  if (method === 'GET' && pathname === '/') {
    const html = fs.readFileSync('./public/index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  if (method === 'GET' && pathname.startsWith('/')) {
    const filePath = path.join(__dirname, 'public', pathname);
    if (fs.existsSync(filePath)) {
      const ext = pathname.split('.').pop();
      const types = { css: 'text/css', js: 'application/javascript' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  /* ---------- API AUTH ---------- */
  if (pathname.startsWith('/api') && !auth(req, res)) return;

  /* ---------- API ROUTES ---------- */
  if (method === 'GET' && pathname === '/api/tareas') {
    json(res, tareas);
    return;
  }

  if (method === 'POST' && pathname === '/api/tareas') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const data = JSON.parse(body);
      const tarea = {
        id: nextId++,
        titulo: data.titulo,
        completada: false,
        prioridad: data.prioridad || 'media',
        fecha: new Date().toISOString().slice(0,10)
      };
      tareas.push(tarea);
      json(res, tarea, 201);
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/estadisticas') {
    json(res, {
      porPrioridad: statsPorPrioridad(),
      completadasPorDia: statsCompletadasPorDia()
    });
    return;
  }

  json(res, { error: 'Not found' }, 404);
});

server.listen(PORT, () =>
  console.log(`Servidor en http://localhost:${PORT}`)
);
