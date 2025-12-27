const translations = {
  en: {
    WELCOME: "Welcome to the API",
    USER_CREATED: "User created successfully",
    NOT_FOUND: "Resource not found"
  },
  es: {
    WELCOME: "Bienvenido a la API",
    USER_CREATED: "Usuario creado exitosamente",
    NOT_FOUND: "Recurso no encontrado"
  }
};

const i18n = (req, res, next) => {
  const lang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'en';
  req.t = (key) => (translations[lang] || translations['en'])[key] || key;
  next();
};

module.exports = i18n;