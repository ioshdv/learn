const Joi = require('joi');

const userSchema = Joi.object({
  nombre: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  activo: Joi.boolean().default(true)
});

const validateSchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validación fallida',
      detalle: error.details[0].message
    });
  }
  next();
};

module.exports = { validateSchema, userSchema };