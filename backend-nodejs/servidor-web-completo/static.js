const fs = require('fs');
const path = require('path');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8'
};

module.exports = (req, res) => {
    const startTime = Date.now();
    let url = req.url === '/' ? '/views/home.html' : req.url;
    
    const isView = url.includes('/views/') || url.endsWith('.html');
    const fullPath = isView 
        ? path.join(__dirname, 'views', path.basename(url, '.html') + '.html')
        : path.join(__dirname, 'public', url);

    if (!fs.existsSync(fullPath)) {
        res.writeHead(404);
        return res.end("No encontrado");
    }

    const ext = path.extname(fullPath);
    if (ext === '.html') {
        const layout = fs.readFileSync(path.join(__dirname, 'views', 'layout.html'), 'utf8');
        let body = fs.readFileSync(fullPath, 'utf8');
        const productos = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'productos.json'), 'utf8'));
        const isLogueado = req.headers.cookie && req.headers.cookie.includes('session=admin');

        // 1. RENDERIZAR EL BUCLE DE PRODUCTOS (HOME)
        if (body.includes('{{#each productos}}')) {
            const match = body.match(/{{#each productos}}([\s\S]*?){{\/each}}/);
            if (match) {
                const template = match[1];
                const itemsHtml = productos.map(p => {
                    return template
                        .replace(/{{\s*nombre\s*}}/g, p.nombre)
                        .replace(/{{\s*precio\s*}}/g, p.precio)
                        .replace(/{{\s*id\s*}}/g, p.id)
                        .replace(/{{\s*this\.imagen\s*}}/g, p.imagen);
                }).join('');
                body = body.replace(match[0], itemsHtml);
            }
        }

        // 2. RENDERIZAR DATOS DE PRODUCTO (DETALLE)
        if (req.productoData) {
            const p = req.productoData;
            body = body
                .replace(/{{\s*producto\.nombre\s*}}/g, p.nombre)
                .replace(/{{\s*producto\.precio\s*}}/g, p.precio)
                .replace(/{{\s*producto\.categoria\s*}}/g, p.categoria)
                .replace(/{{\s*producto\.descripcion\s*}}/g, p.descripcion)
                .replace(/{{\s*producto\.imagen\s*}}/g, p.imagen);

            // Renderizar comentarios dentro del detalle
            const cMatch = body.match(/{{#each comentarios}}([\s\S]*?){{\/each}}/);
            if (cMatch) {
                const cTemplate = cMatch[1];
                const coms = p.comentarios || [];
                const comsHtml = coms.map(c => 
                    cTemplate.replace(/{{\s*usuario\s*}}/g, c.usuario).replace(/{{\s*texto\s*}}/g, c.texto)
                ).join('');
                body = body.replace(cMatch[0], comsHtml || "No hay comentarios.");
            }
        }

        // 3. FUSIONAR CON LAYOUT
        let finalHtml = layout.replace('{{{content}}}', body);

        // 4. LIMPIAR TODOS LOS IF USER (Global)
        // Maneja tanto {{#if user}}...{{else}}...{{/if}} como {{#if user}}...{{/if}}
        const ifRegex = /{{#if user}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g;
        finalHtml = finalHtml.replace(ifRegex, (match, p1, p2) => {
            return isLogueado ? p1.trim() : (p2 ? p2.trim() : "");
        });

        // Reemplazar variable user sobrante
        finalHtml = finalHtml.replace(/{{\s*user\s*}}/g, isLogueado ? 'admin' : '');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        console.log(`[PERFORMANCE] ${url} cargado en ${Date.now() - startTime}ms`);
        return res.end(finalHtml);
    }

    // Archivos estáticos (CSS, JS)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(fs.readFileSync(fullPath));
};