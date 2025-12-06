const validarUsuario = require('../src/validarUsuario');

// CASOS VÁLIDOS
console.log(validarUsuario({ nombre: "Ana", edad: 22, correo: "ana@mail.com" }));

// CASOS INVÁLIDOS
console.log(validarUsuario({ nombre: "John", edad: 22, correo: "ana@mail.com" }));
console.log(validarUsuario({ nombre: "Luis", edad: 19, correo: "luis@mail.com" }));
console.log(validarUsuario({ nombre: "Ana", edad: 22, correo: "anai@correo.com" }));
