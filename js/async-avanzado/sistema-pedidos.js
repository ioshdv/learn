/**
 * sistema-pedidos.js
 *
 * Sistema de scraping concurrente con:
 * - Promise.allSettled para agregación segura
 * - Reintentos automáticos con backoff exponencial
 * - Rate limiting / concurrency limit (semaphore)
 * - Timeouts por petición (AbortController)
 * - Async generator para procesar datos en streaming
 * - Reporte de rendimiento (JSON + CSV) y guardado a disco
 *
 * Ejecutar: node sistema-pedidos.js
 */

import fs from 'fs/promises';
import { writeFileSync } from 'fs';
import { performance } from 'perf_hooks';

// --- Configuración ---
const CONFIG = {
  concurrency: 4,          // número máximo de peticiones simultáneas
  delayBetweenRequests: 100, // ms de "pace" entre inicios de peticiones (rate limiting soft)
  maxRetries: 3,
  baseRetryDelay: 300,    // ms para backoff exponencial
  requestTimeout: 5000,   // ms timeout por petición
  outputReportJson: './reporte-rendimiento.json',
  outputReportCsv: './reporte-rendimiento.csv'
};

// --- Utilities ---
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Simple semaphore para controlar concurrencia */
class Semaphore {
  constructor(max) {
    this.max = max;
    this.current = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    await new Promise(resolve => this.queue.push(resolve));
    this.current++;
  }

  release() {
    this.current = Math.max(0, this.current - 1);
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    }
  }
}

/** Helper para timeout de fetch (usa AbortController) */
function fetchWithTimeout(input, init = {}, timeout = CONFIG.requestTimeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const signal = controller.signal;
  return fetch(input, { ...init, signal })
    .finally(() => clearTimeout(id));
}

/** Reintentos con backoff exponencial */
async function withRetries(fn, args = [], { retries = CONFIG.maxRetries, baseDelay = CONFIG.baseRetryDelay } = {}) {
  let attempt = 0;
  while (true) {
    try {
      attempt++;
      return await fn(...args, attempt);
    } catch (err) {
      if (attempt > retries) throw err;
      const backoff = baseDelay * (2 ** (attempt - 1)) + Math.floor(Math.random() * 100);
      console.warn(`Intento ${attempt} falló: ${err.message}. Reintentando en ${backoff}ms...`);
      await sleep(backoff);
    }
  }
}

/** Funcion principal de fetch con reintentos y timeout */
async function fetchJsonWithRetries(url, attempt = 1) {
  const start = performance.now();
  try {
    const res = await fetchWithTimeout(url, {}, CONFIG.requestTimeout);
    const duration = Math.round(performance.now() - start);
    if (!res.ok) {
      const text = await res.text().catch(()=>'<no body>');
      throw new Error(`HTTP ${res.status} - ${text.slice(0,200)}`);
    }
    // Intentamos parsear JSON, si falla fallback a texto
    const contentType = res.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return { success: true, url, duration, attempt, status: res.status, body };
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    throw { success: false, url, duration, attempt, error: error.name === 'AbortError' ? 'Timeout' : (error.message || String(error)), rawError: error };
  }
}

// --- Async generator que produce resultados a medida que llegan ---
// Toma una lista de URLs y produce resultados (fulfilled o rejected info)
// Internamente controla concurrencia con Semaphore y aplica rate limiting soft
async function* fetchUrlsGenerator(urls, options = {}) {
  const sem = new Semaphore(options.concurrency ?? CONFIG.concurrency);
  const resultsQueue = []; // guardamos promesas que representan tareas en vuelo
  let index = 0;

  // Lanzador de tareas (no espera)
  const launchNext = async (i) => {
    const url = urls[i];
    await sem.acquire();
    try {
      // añadir un pequeño delay para suavizar picos
      if (options.delayBetweenRequests ?? CONFIG.delayBetweenRequests) {
        await sleep(options.delayBetweenRequests ?? CONFIG.delayBetweenRequests);
      }

      // Ejecutar con reintentos
      const res = await withRetries(fetchJsonWithRetries, [url], { retries: options.maxRetries ?? CONFIG.maxRetries, baseDelay: options.baseRetryDelay ?? CONFIG.baseRetryDelay });
      return { index: i, result: res };
    } catch (err) {
      // err puede ser objeto arrojado por fetchJsonWithRetries o un Error si los reintentos se agotaron
      return { index: i, error: err };
    } finally {
      sem.release();
    }
  };

  // Lanzamos hasta concurrency inicial
  const total = urls.length;
  const inflight = new Set();

  while (index < total || inflight.size > 0) {
    // lanzar tareas mientras haya slots y URLs pendientes
    while (index < total && inflight.size < (options.concurrency ?? CONFIG.concurrency)) {
      const i = index++;
      const p = launchNext(i).then(res => ({ idx: i, payload: res }));
      inflight.add(p);
      // cuando termine, removerá del set (pero no bloquea aquí)
      p.finally(() => inflight.delete(p));
    }

    if (inflight.size === 0) break;

    // Esperar a que al menos una promesa termine
    const finished = await Promise.race(Array.from(inflight));
    // finished = { idx, payload }
    yield finished.payload;
  }
}

// --- Recolección y reporte usando Promise.allSettled ---
// Dado que el generator produce resultados según van saliendo, además queremos una vista final
async function procesarYReportar(urls) {
  const resultados = [];
  const stats = {
    total: urls.length,
    success: 0,
    failed: 0,
    totalTime: 0, // suma de duraciones
    avgTime: 0,
    attempts: []
  };

  console.log(`Iniciando scraping de ${urls.length} URLs con concurrencia ${CONFIG.concurrency}...`);

  // 1) Consumir el async generator y acumular promesas de "procesamiento final"
  const procesarLinea = async (item) => {
    // item: { index, result } o { index, error }
    if (item.result) {
      resultados[item.index] = {
        url: item.result.url,
        ok: true,
        duration: item.result.duration,
        attempt: item.result.attempt,
        status: item.result.status,
        snippet: typeof item.result.body === 'string' ? item.result.body.slice(0,200) : (JSON.stringify(item.result.body).slice(0,200)),
        body: item.result.body
      };
      stats.success++;
      stats.totalTime += item.result.duration;
      stats.attempts.push(item.result.attempt);
    } else {
      const err = item.error;
      resultados[item.index] = {
        url: err.url || urls[item.index],
        ok: false,
        duration: err.duration || 0,
        attempt: err.attempt || (CONFIG.maxRetries + 1),
        error: err.error || err.message || String(err)
      };
      stats.failed++;
      stats.totalTime += (err.duration || 0);
      stats.attempts.push(err.attempt || (CONFIG.maxRetries + 1));
    }
  };

  // Consumimos el stream
  const generator = fetchUrlsGenerator(urls);
  for await (const item of generator) {
    // item = { index, result } or { index, error }
    await procesarLinea(item);
    console.log(`[${(resultados[item.index].ok ? 'OK ' : 'ERR')}] (${item.index + 1}/${urls.length}) ${resultados[item.index].url} - ${resultados[item.index].ok ? resultados[item.index].duration + 'ms' : 'falló'}`);
  }

  // 2) Aseguramos que tenemos tantos elementos como URLs (el orden puede variar)
  // Calcular promedio
  stats.avgTime = stats.success + stats.failed > 0 ? Math.round(stats.totalTime / (stats.success + stats.failed)) : 0;
  stats.attemptsSummary = {
    min: Math.min(...stats.attempts),
    max: Math.max(...stats.attempts),
    avg: Math.round(stats.attempts.reduce((a,b)=>a+b,0)/stats.attempts.length)
  };

  const report = {
    generatedAt: new Date().toISOString(),
    config: CONFIG,
    summary: {
      total: stats.total,
      success: stats.success,
      failed: stats.failed,
      avgTimeMs: stats.avgTime,
      attempts: stats.attemptsSummary
    },
    details: resultados
  };

  // Guardar reporte JSON
  await fs.writeFile(CONFIG.outputReportJson, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Reporte JSON guardado en ${CONFIG.outputReportJson}`);

  // Guardar CSV básico
  const csvLines = ['index,url,ok,duration_ms,attempts,error_snippet'];
  for (let i = 0; i < resultados.length; i++) {
    const r = resultados[i] || {};
    csvLines.push(`${i + 1},"${(r.url||'').replace(/"/g,'""')}",${r.ok ? 'OK' : 'ERR'},${r.duration||0},${r.attempt||''},"${(r.error || String(r.snippet || '')).toString().replace(/"/g,'""')}"`);
  }
  writeFileSync(CONFIG.outputReportCsv, csvLines.join('\n'), 'utf8');
  console.log(`Reporte CSV guardado en ${CONFIG.outputReportCsv}`);

  // Mostrar resumen en consola
  console.log('--- RESUMEN ---');
  console.log(`Total: ${stats.total}, Exitosos: ${stats.success}, Fallidos: ${stats.failed}`);
  console.log(`Tiempo promedio por petición (ms): ${stats.avgTime}`);
  console.log('----------------');

  return report;
}

// --- DEMO / USO ---
// Lista de URLs de ejemplo. Usa endpoints públicos para practicar.
// Puedes reemplazar por las páginas que desees scrapearear (respeta robots.txt y términos).
const sampleUrls = [
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/posts/2',
  'https://jsonplaceholder.typicode.com/posts/3',
  'https://jsonplaceholder.typicode.com/posts/4',
  'https://jsonplaceholder.typicode.com/posts/5',
  // Añade muchas más para probar concurrencia y fallos:
  'https://jsonplaceholder.typicode.com/posts/100',
  'https://jsonplaceholder.typicode.com/invalid-url', // forzar fallo HTTP 404
  'https://httpstat.us/200?sleep=2000', // respuesta lenta
  'https://httpstat.us/503', // servicio temporalmente no disponible
  'https://jsonplaceholder.typicode.com/comments?postId=1'
];

async function main() {
  try {
    // Puedes ajustar configuración antes de ejecutar:
    CONFIG.concurrency = 3;
    CONFIG.maxRetries = 2;
    CONFIG.requestTimeout = 4000;

    const report = await procesarYReportar(sampleUrls);

    // Ejemplo adicional: procesar resultados en streaming para guardarlos individualmente
    // (solo como demostración; aquí ya los guardamos en el reporte)
    // Podrías iterar por report.details y hacer transformaciones/almacenamiento incremental.
  } catch (err) {
    console.error('Error en main:', err);
  }
}

main();
