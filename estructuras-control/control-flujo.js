// === VALIDACIÓN DE FORMULARIO DE REGISTRO (CLÍNICA) ===

console.log("=== VALIDACIÓN DE FORMULARIO ===\n");

// Función que valida el formato básico de un email
function emailValido(email) {
  return email.includes("@") && email.includes(".");
}

// Función que valida si la contraseña cumple criterios mínimos
// Reglas: mínimo 8 caracteres, al menos un número y una letra
function contrasenaSegura(contrasena) {
  let tieneNumero = false;
  let tieneLetra = false;

  for (let c of contrasena) {
    if (!isNaN(c)) {
      tieneNumero = true;
    } else if (/[a-zA-Z]/.test(c)) {
      tieneLetra = true;
    }
  }

  return contrasena.length >= 8 && tieneNumero && tieneLetra;
}

// Función principal para validar el formulario completo
function validarFormulario(datos) {
  try {
    // Validación de nombre
    if (!datos.nombre || datos.nombre.trim() === "") {
      throw new Error("El campo 'nombre' no puede estar vacío.");
    }

    // Validación de email
    if (!emailValido(datos.email)) {
      throw new Error("El email proporcionado no es válido.");
    }

    // Validación de edad
    if (typeof datos.edad !== "number" || datos.edad < 18 || datos.edad > 99) {
      throw new Error("La edad debe estar entre 18 y 99 años.");
    }

    // Validación de contraseña
    if (!contrasenaSegura(datos.contrasena)) {
      throw new Error("La contraseña debe tener mínimo 8 caracteres e incluir letras y números.");
    }

    console.log("✔ Validación completada. Datos correctos.");

  } catch (error) {
    console.log(`❌ Error de validación: ${error.message}`);
  }
}

// Datos de prueba
let formulario1 = {
  nombre: "Juan Pérez",
  email: "juan@example.com",
  edad: 25,
  contrasena: "abc12345"
};

let formulario2 = {
  nombre: "",
  email: "correo-sin-arroba",
  edad: 15,
  contrasena: "1234"
};

console.log("Validando formulario 1...");
validarFormulario(formulario1);

console.log("\nValidando formulario 2...");
validarFormulario(formulario2);
