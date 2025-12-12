// event-system.js
// Simple cache system with TTL + LRU/FIFO + EventBus
// Uses closures and module pattern for encapsulation

// ===============================================
// 1. EventBus
// ===============================================
const EventBus = (function () {
  const listeners = new Map();

  return {
    on(evento, callback) {
      if (!listeners.has(evento)) {
        listeners.set(evento, new Set());
      }
      listeners.get(evento).add(callback);
    },

    off(evento, callback) {
      if (listeners.has(evento)) {
        listeners.get(evento).delete(callback);
      }
    },

    emit(evento, datos) {
      if (listeners.has(evento)) {
        listeners.get(evento).forEach(cb => {
          try { cb(datos); } catch (e) { console.error(e); }
        });
      }
    },

    clear() {
      listeners.clear();
    }
  };
})();

// ===============================================
// 2. Cache con closures - Soporta TTL, LRU/FIFO, estadísticas
// ===============================================
const Cache = (function (eventBus) {
  // Configuración
  const config = {
    maxSize: 5,          // máximo 5 elementos
    defaultTTL: 5000,    // 5 segundos por defecto
    strategy: 'LRU'      // puede ser 'LRU' o 'FIFO'
  };

  // Datos privados (capturados por los closures)
  const store = new Map();                    // key → { value, expires, timestamp }
  const order = [];                           // para LRU y FIFO
  const stats = { hits: 0, misses: 0 };

  // Función privada: eliminar el elemento más viejo según estrategia
  function evict() {
    if (order.length === 0) return;

    let keyToRemove;
    if (config.strategy === 'LRU') {
      keyToRemove = order.shift();           // el menos usado recientemente (primero de la lista)
    } else {
      keyToRemove = order.pop();               // FIFO: el más antiguo (último de la lista)
    }

    const item = store.get(keyToRemove);
    store.delete(keyToRemove);
    eventBus.emit('cache:eviction', { key: keyToRemove, value: item.value });
  }

  // Función privada: mover al final (para LRU)
  function touch(key) {
    if (config.strategy === 'LRU') {
      const index = order.indexOf(key);
      if (index > -1) {
        order.splice(index, 1);
        order.push(key);
      }
    }
  }

  // API pública del Cache
  return {
    // Cambiar estrategia en caliente (útil para probar)
    setStrategy(strategy) {
      if (!['LRU', 'FIFO'].includes(strategy)) {
        throw new Error('Estrategia no válida. Usa "LRU" o "FIFO"');
      }
      config.strategy = strategy;
    },

    // Poner valor con TTL opcional (en ms)
    set(key, value, ttl = config.defaultTTL) {
      // Si está lleno, expulsar uno
      if (store.size >= config.maxSize) {
        evict();
      }

      const expires = ttl ? Date.now() + ttl : null;

      store.set(key, { value, expires, timestamp: Date.now() });
      
      // Para FIFO: agregar al final; para LRU: también al final
      if (!order.includes(key)) {
        order.push(key);
      } else {
        touch(key); // en LRU lo movemos al final
      }
    },

    // Obtener valor
    get(key) {
      const now = Date.now();
      const item = store.get(key);

      if (!item) {
        stats.misses++;
        eventBus.emit('cache:miss', { key });
        return undefined;
      }

      // Verificar TTL
      if (item.expires && now > item.expires) {
        store.delete(key);
        const index = order.indexOf(key);
        if (index > -1) order.splice(index, 1);
        eventBus.emit('cache:eviction', { key, value: item.value, reason: 'expired' });
        stats.misses++;
        eventBus.emit('cache:miss', { key });
        return undefined;
      }

      // Hit exitoso
      stats.hits++;
      touch(key); // importante para LRU
      eventBus.emit('cache:hit', { key, value: item.value });
      return item.value;
    },

    // Estadísticas
    getStats() {
      return {
        hits: stats.hits,
        misses: stats.misses,
        size: store.size,
        totalRequests: stats.hits + stats.misses,
        hitRatio: stats.hits + stats.misses === 0 ? 0 : (stats.hits / (stats.hits + stats.misses)).toFixed(2)
      };
    },

    // Limpiar todo
    clear() {
      store.clear();
      order.length = 0;
      stats.hits = 0;
      stats.misses = 0;
    }
  };
})(EventBus);

// ===============================================
// 3. Demostración
// ===============================================

console.log("Sistema de Cache con TTL + EventBus + LRU/FIFO");
console.log("================================================\n");

// Escuchar eventos del cache
EventBus.on('cache:hit', data => console.log(`Hit: ${data.key} →`, data.value));
EventBus.on('cache:miss', data => console.log(`Miss: ${data.key}`));
EventBus.on('cache:eviction', data => console.log(`Eviction: ${data.key} (razón: ${data.reason || 'capacity'})`));

// Pruebas
Cache.set('usuario:1', { nombre: 'Ana' }, 3000);     // expira en 3s
Cache.set('usuario:2', { nombre: 'Luis' });

console.log(Cache.get('usuario:1')); // Hit
console.log(Cache.get('usuario:2')); // Hit
console.log(Cache.get('usuario:3')); // Miss

setTimeout(() => {
  console.log("\n--- Después de 4 segundos (TTL expirado) ---");
  console.log(Cache.get('usuario:1')); // Miss + eviction por TTL
}, 4000);

setTimeout(() => {
  console.log("\n--- Probando límite de tamaño (5) con LRU ---");
  Cache.set('a', 1);
  Cache.set('b', 2);
  Cache.set('c', 3);
  Cache.set('d', 4);
  Cache.set('e', 5);
  Cache.set('f', 6); // eviction 'a' (LRU)

  Cache.get('b'); // toca 'b' → se vuelve el más reciente
  Cache.set('g', 7); // eviction 'c' (el más viejo entre los no tocados)

  console.log("\nEstadísticas finales:");
  console.log(Cache.getStats());
}, 6000);

setTimeout(() => {
  console.log("\n--- Cambiando a FIFO ---");
  Cache.clear();
  Cache.setStrategy('FIFO');

  Cache.set('x', 10);
  Cache.set('y', 20);
  Cache.set('z', 30);
  Cache.set('w', 40); // FIFO eviction 'x'

  console.log("Después de cambiar a FIFO, estadísticas:");
  console.log(Cache.getStats());
}, 9000);