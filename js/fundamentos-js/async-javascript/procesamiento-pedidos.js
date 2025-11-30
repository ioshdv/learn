/* Programa que simula la sincronización de datos de una tienda online
descargando productos, clientes y ventas de 3 APIs externas en paralelo, 
comparando 3 formas de manejar operaciones asíncronas en JS.
*/

console.log("=== SINCRONIZACION ECOMMERCE ===\n");

// APIs con CALLBACKS y PROMISES
const apiProductos = (callback) => {
  setTimeout(() => {
    if (Math.random() > 0.2) {
      callback(null, ["iPhone", "MacBook", "AirPods"]);
    } else {
      callback("Productos fallo", null);
    }
  }, 1000);
};

const apiClientes = (callback) => {
  setTimeout(() => {
    if (Math.random() > 0.1) {
      callback(null, ["Ana", "Carlos"]);
    } else {
      callback("Clientes fallo", null);
    }
  }, 800);
};

const apiVentas = (callback) => {
  setTimeout(() => {
    if (Math.random() > 0.3) {
      callback(null, ["Venta 1", "Venta 2"]);
    } else {
      callback("Ventas fallo", null);
    }
  }, 1200);
};

// Guardar
const guardar = (datos, tipo) => {
  console.log(`Guardados ${datos.length} ${tipo}`);
  return Promise.resolve();
};

// 1. CALLBACKS ANIDADOS (LENTO)
function conCallbacks() {
  console.log("1. CALLBACKS:");
  const inicio = Date.now();
  
  apiProductos((err1, productos) => {
    if (err1) return console.log("Productos fallo");
    console.log("Productos OK");
    
    apiClientes((err2, clientes) => {
      if (err2) return console.log("Clientes fallo");
      console.log("Clientes OK");
      
      apiVentas((err3, ventas) => {
        if (err3) console.log("Ventas fallo");
        else console.log("Ventas OK");
        console.log(`CALLBACKS: ${Date.now() - inicio}ms (LENTO)`);
      });
    });
  });
}

// 2. PROMISES
function conPromises() {
  console.log("\n2. PROMISES:");
  const inicio = Date.now();
  
  Promise.all([
    new Promise((resolve) => apiProductos((err, data) => resolve(err ? null : data))),
    new Promise((resolve) => apiClientes((err, data) => resolve(err ? null : data))),
    new Promise((resolve) => apiVentas((err, data) => resolve(err ? null : data)))
  ])
  .then(([productos, clientes, ventas]) => {
    const ok = [productos, clientes, ventas].filter(Boolean).length;
    console.log(`TODOS OK: ${ok}/3`);
    return guardar([], "todo");
  })
  .then(() => console.log(`PROMISES: ${Date.now() - inicio}ms (RAPIDO)`))
  .catch(() => console.log(`ERROR EN PROMISES`));
}

// 3. ASYNC/AWAIT
async function conAsyncAwait() {
  console.log("\n3. ASYNC/AWAIT:");
  const inicio = Date.now();
  
  try {
    const [productos, clientes, ventas] = await Promise.all([
      new Promise(res => apiProductos((err, data) => res(err ? null : data))),
      new Promise(res => apiClientes((err, data) => res(err ? null : data))),
      new Promise(res => apiVentas((err, data) => res(err ? null : data)))
    ]);
    
    const ok = [productos, clientes, ventas].filter(Boolean).length;
    console.log(`TODOS OK: ${ok}/3`);
    await guardar([], "todo");
    
    console.log(`ASYNC/AWAIT: ${Date.now() - inicio}ms (RAPIDO)`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

// EJECUTAR
console.log("EJECUTANDO...\n");
conCallbacks();

setTimeout(() => conPromises(), 3500);
setTimeout(() => conAsyncAwait(), 5000);

setTimeout(() => {
  console.log("\nGANADOR: ASYNC/AWAIT");
  console.log("Mas simple = menos errores");
  console.log("Mas rapido = Promise.all()");
  console.log("Mas legible = try/catch");
}, 7000);