const axios = require('axios');

// Transformador XML (Adicional para robustez)
function objectToXML(obj, rootName = 'response') {
  function toXML(data, name) {
    if (data === null || data === undefined) return '';
    if (typeof data === 'object' && !Array.isArray(data)) {
      const children = Object.entries(data).map(([key, value]) => toXML(value, key)).join('');
      return `<${name}>${children}</${name}>`;
    }
    if (Array.isArray(data)) {
      return `<${name}>${data.map(item => toXML(item, 'item')).join('')}</${name}>`;
    }
    return `<${name}>${data}</${name}>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXML(obj, rootName)}`;
}

// Almacén de suscriptores
const webhooks = []; 

/**
 * REQUISITO: Sistema de Webhooks para notificar cambios
 */
const notifyWebhooks = async (event, data) => {
  const notifications = webhooks.map(url => 
    axios.post(url, {
      event,
      timestamp: new Date().toISOString(),
      data
    }).catch(err => {
      // El fallo de un suscriptor no debe detener el servidor
      console.error(`Error enviando webhook a ${url}: ${err.message}`);
    })
  );
  await Promise.all(notifications);
};

module.exports = { objectToXML, notifyWebhooks, webhooks };