const http = require('http');
const router = require('./router');

const server = http.createServer((req, res) => {
    router(req, res);
});

server.listen(3000, () => {
    console.log('🚀 StoreNode corriendo en http://localhost:3000');
});