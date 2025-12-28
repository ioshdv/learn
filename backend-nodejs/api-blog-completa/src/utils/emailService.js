const nodemailer = require('nodemailer');

const sendNotification = async (to, subject, text) => {
  // Configuración de prueba (Ethereal o similar)
  console.log(`[EMAIL SIMULADO] Para: ${to} | Asunto: ${subject}`);
};

module.exports = { sendNotification };