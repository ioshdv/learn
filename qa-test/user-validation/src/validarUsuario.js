function validarUsuario(usuario) {
  const { nombre, edad, correo } = usuario;

  if (!nombre || nombre.trim() === "") {
    return { valido: false, mensaje: "El nombre no puede estar vacío." };
  }

  if (edad < 18) {
    return { valido: false, mensaje: "El usuario debe ser mayor o igual a 18 años." };
  }

  // Solo revisa si contiene "@", como dice la regla
  if (!correo.includes("@")) {
    return { valido: false, mensaje: "El correo debe contener el símbolo @." };
  }

  return { valido: true, mensaje: "Usuario válido." };
}

module.exports = validarUsuario;
