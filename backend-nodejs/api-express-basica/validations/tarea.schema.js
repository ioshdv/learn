const Joi = require('joi');

const tareaSchema = Joi.object({
  titulo: Joi.string().min(3).required().messages({
    'string.min': 'El título debe tener al menos 3 caracteres',
    'any.required': 'El título es obligatorio'
  }),
  descripcion: Joi.string().allow('').optional(),
  completada: Joi.boolean().optional()
});

module.exports = { tareaSchema };