module.exports = {
    metricasServer: (req, res, next) => {
        const inicio = Date.now();
        res.on('finish', () => {
            const duracion = Date.now() - inicio;
            const log = `[METRICA] ${new Date().toLocaleTimeString()} | ${req.method} ${req.url} - ${duracion}ms\n`;
            process.stdout.write(log);
        });
        next();
    }
};