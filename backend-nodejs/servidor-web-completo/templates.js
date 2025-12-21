const fs = require('fs').promises;

module.exports = class TemplateEngine {
    async render(name, data = {}) {
        try {
            const layout = await fs.readFile('./views/layout.html', 'utf8');
            const view = await fs.readFile(`./views/${name}.html`, 'utf8');
            let html = layout.replace('{{{content}}}', view);

            // Bucle #each
            html = html.replace(/\{\{\s*#each\s+(\w+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g, (match, listName, inner) => {
                const list = data[listName] || [];
                return list.map(item => {
                    let temp = inner;
                    Object.keys(item).forEach(key => {
                        temp = temp.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), item[key]);
                    });
                    return temp;
                }).join('');
            });

            // Condicional #if (Soporta {{#if user}} y {{#if !user}})
            html = html.replace(/\{\{\s*#if\s+(!?\w+)\s*\}\}([\s\S]*?)\{\{\s*\/if\s*\}\}/g, (match, key, content) => {
                const isNegative = key.startsWith('!');
                const actualKey = isNegative ? key.substring(1) : key;
                const condition = isNegative ? !data[actualKey] : !!data[actualKey];
                return condition ? content : '';
            });

            // Variables simples {{variable}}
            html = html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
                const val = key.split('.').reduce((o, i) => o?.[i], data);
                return val !== undefined ? val : '';
            });

            return html;
        } catch (err) {
            console.error("Error en TemplateEngine:", err);
            return "<h1>Error de Renderizado</h1>";
        }
    }
};