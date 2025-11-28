console.log("=== Mi Tienda Super Top ===");

// ------------------------------
// Variables globales
// ------------------------------
var tienda = "Tienda Super Top";  // var: se puede usar en toda la función o archivo
let totalVentas = 0;       // let: solo funciona dentro del bloque donde se declara
const IVA = 0.19;          // const: no se puede cambiar, también solo dentro del bloque

console.log("Tienda: ", tienda);
console.log("IVA:", (IVA * 100) + "%");

// ------------------------------
// Hoisting y TDZ
// ------------------------------
console.log("\n--- Hoisting y TDZ ---");

// Hoisting: las variables con var “aparecen” arriba aunque estén abajo
console.log(producto); // undefined por hoisting
var producto = "Smart TV 55\"";

// TDZ (Temporal Dead Zone): let y const no se pueden usar antes de declararlas
// console.log(precio); // ReferenceError si descomentas
let enStock = true;    // let -> solo funciona dentro del bloque
const precio = 89990;  // const -> solo funciona dentro del bloque

console.log("Producto:", producto);
console.log("Precio:", precio);
console.log("En stock:", enStock);

// ------------------------------
// Función y scope
// ------------------------------
function procesarCompra() {
  if (true) {
    var metodoPago = "BancoPay Demo";         // var: funciona en toda la función, aunque esté dentro del if
    let subtotal = 150000;                // let: solo dentro del if
    const total = Math.round(subtotal * (1 + IVA)); // const: solo dentro del if

    totalVentas += total;                 // actualizamos variable global

    console.log("Subtotal:", subtotal);
    console.log("IVA:", Math.round(subtotal * IVA));
    console.log("Total:", total);
  }

  console.log("Método de pago:", metodoPago); // funciona porque var se ve en toda la función
  // console.log(total); // Error: let/const solo existen dentro del if
}

procesarCompra();

console.log("Total ventas del día:", totalVentas);

// ------------------------------
// Configuración y buenas prácticas
// ------------------------------
const CONFIG = {
  nombre: "Tienda Super Top - Oriente",
  pais: "Chile",
  IVA: 0.19,
  precioOferta: 89990
};

let clientes = 512;  // let: se puede cambiar dentro del bloque
clientes += 48;

console.log("Clientes conectados:", clientes);
console.log("¡Gracias por su compra en nuestra Tienda Super Top!");
