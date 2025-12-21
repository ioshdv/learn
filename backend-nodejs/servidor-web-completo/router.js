const fs = require('fs');
const path = require('path');
const staticServer = require('./static');

module.exports = (req, res) => {
    const url = req.url.split('?')[0];

    // API LOGIN
    if (url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            const { user, pass } = JSON.parse(body);
            if (user === 'admin' && pass === '1234') {
                res.writeHead(200, { 'Set-Cookie': 'session=admin; Path=/; HttpOnly', 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
            } else {
                res.writeHead(401); res.end();
            }
        });
        return;
    }

    // API COMENTARIOS
    if (url === '/api/comentarios' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            const { productoId, texto } = JSON.parse(body);
            const isLogueado = req.headers.cookie?.includes('session=admin');
            if (!isLogueado) { res.writeHead(401); return res.end(); }

            const dataPath = path.join(__dirname, 'data', 'productos.json');
            let productos = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            const index = productos.findIndex(p => p.id == productoId);
            
            if (index !== -1) {
                if (!productos[index].comentarios) productos[index].comentarios = [];
                productos[index].comentarios.push({ usuario: 'admin', texto });
                fs.writeFileSync(dataPath, JSON.stringify(productos, null, 2));
                res.writeHead(200); res.end();
            }
        });
        return;
    }

    // DETALLE PRODUCTO
    if (url.startsWith('/productos/')) {
        const id = url.split('/')[2];
        const productos = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'productos.json'), 'utf8'));
        const producto = productos.find(p => p.id == id);
        if (producto) {
            req.productoData = producto;
            req.url = '/views/producto-detalle.html';
        }
    }

    staticServer(req, res);
};