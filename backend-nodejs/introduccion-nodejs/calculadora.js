// calculadora.js
// Calculadora Interactiva

const readline = require("readline");

// Crear interfaz de lectura de la terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función que realiza la operación
function calcular(op, a, b) {
  switch (op.toLowerCase()) {
    case "sumar":
      return a + b;
    case "restar":
      return a - b;
    case "multiplicar":
      return a * b;
    case "dividir":
      if (b === 0) return "Error: división por cero";
      return a / b;
    default:
      return null;
  }
}

// Función principal interactiva
function iniciarCalculadora() {
  console.log("Operaciones disponibles: sumar, restar, multiplicar, dividir");

  rl.question("Elige una operación: ", (operacion) => {
    rl.question("Ingresa el primer número: ", (num1Str) => {
      rl.question("Ingresa el segundo número: ", (num2Str) => {
        const num1 = parseFloat(num1Str);
        const num2 = parseFloat(num2Str);

        if (isNaN(num1) || isNaN(num2)) {
          console.log("Error: Debes ingresar números válidos.");
        } else {
          const resultado = calcular(operacion, num1, num2);
          if (resultado === null) {
            console.log("Operación no válida. Usa: sumar, restar, multiplicar, dividir");
          } else {
            console.log(`Resultado: ${resultado}`);
          }
        }

        // Preguntar si quiere hacer otra operación
        rl.question("¿Quieres hacer otra operación? (si/no): ", (respuesta) => {
          if (respuesta.toLowerCase() === "si") {
            iniciarCalculadora(); // reinicia la función
          } else {
            console.log("¡Hasta luego!");
            rl.close();
          }
        });
      });
    });
  });
}

// Iniciar calculadora
iniciarCalculadora();