const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Importar rutas
const authRoutes = require('./src/routes/auth');
const postRoutes = require('./src/routes/posts');
const commentRoutes = require('./src/routes/comments');

// Página de inicio (Interfaz Visual)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>API de Blog</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f4f7f6; }
                .card { background: white; padding: 20px; border-radius: 8px; shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
                h1 { color: #2c3e50; }
                .endpoint { background: #2d3436; color: #dfe6e9; padding: 10px; border-radius: 5px; font-family: monospace; }
                .method { color: #55efc4; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>📝 API de Blog - Dashboard</h1>
            <div class="card">
                <h2>Servicios Activos</h2>
                <p><span class="method">GET</span> <a href="/api/posts">/api/posts</a> - Ver todos los posts</p>
                <p><span class="method">GET</span> <a href="/api/posts/stats">/api/posts/stats</a> - Ver estadísticas (Requiere Token)</p>
                <p><span class="method">GET</span> <a href="/api/docs">/api/docs</a> - Documentación OpenAPI</p>
            </div>
        </body>
        </html>
    `);
});

// Documentación OpenAPI básica
app.get('/api/docs', (req, res) => {
    res.json({
        openapi: '3.0.0',
        info: {
            title: 'API de Blog',
            version: '1.0.0',
            description: 'API REST para gestión de posts y comentarios'
        },
        servers: [{ url: 'http://localhost:3000/api' }]
    });
});

// Montar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor listo en http://localhost:${port}`);
});