const { tareaSchema } = require('../validations/tarea.schema');

/**
 * Middleware de validación del body para tareas
 * Usa Joi y detiene la request si hay errores
 */
function validarBody(req, res, next) {
  const { error, value } = tareaSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: error.details.map(d => d.message)
    });
  }

  // Body validado y saneado
  req.body = value;
  next();
}

module.exports = {
  validarBody
};