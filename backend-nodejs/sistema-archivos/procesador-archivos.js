const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const readline = require('readline');

class ProcesadorArchivos {
  constructor(directorioBase = './archivos') {
    this.directorioBase = path.resolve(directorioBase);
    this.backupDir = path.join(this.directorioBase, 'backup');
    this.index = new Map(); // archivo -> { contenido, ultimaActualizacion }
  }

  async inicializar() {
    await fs.mkdir(this.directorioBase, { recursive: true });
    await fs.mkdir(path.join(this.directorioBase, 'procesados'), { recursive: true });
    await fs.mkdir(path.join(this.directorioBase, 'errores'), { recursive: true });
    await fs.mkdir(this.backupDir, { recursive: true });
    console.log('✅ Estructura de directorios creada');
    await this.actualizarIndice();
  }

  async actualizarIndice() {
    this.index.clear();
    try {
      const archivos = await fs.readdir(this.directorioBase);
      for (const archivo of archivos) {
        if (archivo.endsWith('.txt') || archivo.endsWith('.md')) {
          const ruta = path.join(this.directorioBase, archivo);
          try {
            const contenido = await fs.readFile(ruta, 'utf8');
            const stats = await fs.stat(ruta);
            this.index.set(archivo, {
              contenido,
              ultimaActualizacion: stats.mtime
            });
          } catch (err) {
            // Silenciar errores de archivos no legibles
          }
        }
      }
      console.log(`📇 Índice actualizado: ${this.index.size} archivos indexados`);
    } catch (err) {
      console.error('❌ Error actualizando índice:', err.message);
    }
  }

  async backupArchivo(rutaArchivo) {
    try {
      const nombre = path.basename(rutaArchivo);
      const stats = await fs.stat(rutaArchivo);

      // Buscar si ya existe un backup reciente
      const backups = await fs.readdir(this.backupDir).catch(() => []);
      const backupExistente = backups.find(f => f.startsWith(nombre + '.'));

      if (backupExistente) {
        const rutaBackup = path.join(this.backupDir, backupExistente);
        const statsBackup = await fs.stat(rutaBackup);
        if (statsBackup.mtime >= stats.mtime) {
          console.log(`📦 Backup ya actualizado para: ${nombre}`);
          return;
        }
      }

      const rutaBackup = path.join(this.backupDir, `${nombre}.${Date.now()}.bak`);
      await fs.copyFile(rutaArchivo, rutaBackup);
      console.log(`📦 Backup creado: ${rutaBackup}`);
    } catch (error) {
      console.error('❌ Error creando backup:', error.message);
    }
  }

  async procesarArchivoTexto(rutaArchivo) {
    await this.backupArchivo(rutaArchivo);

    const contenido = await fs.readFile(rutaArchivo, 'utf8');
    const estadisticas = {
      palabras: contenido.split(/\s+/).filter(p => p.length > 0).length,
      caracteres: contenido.length,
      lineas: contenido.split('\n').length,
      ruta: rutaArchivo
    };

    const nombreBase = path.basename(rutaArchivo, path.extname(rutaArchivo));
    const rutaEstadisticas = path.join(this.directorioBase, 'procesados', `${nombreBase}-stats.json`);
    await fs.writeFile(rutaEstadisticas, JSON.stringify(estadisticas, null, 2));

    console.log(`✅ ${nombreBase} procesado: ${estadisticas.palabras} palabras`);
    await this.actualizarIndice();
    return estadisticas;
  }

  async moverAErrores(rutaArchivo, mensajeError) {
    try {
      const nombreArchivo = path.basename(rutaArchivo);
      const rutaError = path.join(this.directorioBase, 'errores', nombreArchivo);
      await fs.rename(rutaArchivo, rutaError);

      const rutaLogError = path.join(this.directorioBase, 'errores', `${nombreArchivo}.error.log`);
      await fs.writeFile(rutaLogError, `Error: ${mensajeError}\nFecha: ${new Date().toISOString()}`);

      console.log(`📁 Archivo movido a errores: ${nombreArchivo}`);
    } catch (error) {
      console.error('❌ Error moviendo archivo a errores:', error.message);
    }
  }

  convertirAMayusculas(rutaEntrada, rutaSalida) {
    return new Promise((resolve, reject) => {
      const transformStream = new Transform({
        transform(chunk, encoding, callback) {
          this.push(chunk.toString().toUpperCase());
          callback();
        }
      });

      const readable = fsSync.createReadStream(rutaEntrada, { encoding: 'utf8' });
      const writable = fsSync.createWriteStream(rutaSalida);

      readable.pipe(transformStream).pipe(writable);

      writable.on('finish', () => {
        console.log(`✅ Archivo convertido a mayúsculas: ${rutaSalida}`);
        resolve(rutaSalida);
      });

      writable.on('error', reject);
      readable.on('error', reject);
    });
  }

  copiarArchivoStreams(rutaOrigen, rutaDestino) {
    return new Promise((resolve, reject) => {
      const readable = fsSync.createReadStream(rutaOrigen);
      const writable = fsSync.createWriteStream(rutaDestino);

      readable.pipe(writable);

      writable.on('finish', () => {
        console.log(`✅ Archivo copiado con streams: ${rutaDestino}`);
        resolve(rutaDestino);
      });

      writable.on('error', reject);
      readable.on('error', reject);
    });
  }

  async procesarDirectorio(rutaDirectorio = this.directorioBase) {
    try {
      const archivos = await fs.readdir(rutaDirectorio);
      const archivosTxt = archivos.filter(a => a.endsWith('.txt') || a.endsWith('.md'));

      console.log(`📂 Procesando ${archivosTxt.length} archivos de texto...`);

      const resultados = [];
      for (const archivo of archivosTxt) {
        const ruta = path.join(rutaDirectorio, archivo);
        try {
          const res = await this.procesarArchivoTexto(ruta);
          resultados.push(res);
        } catch (err) {
          await this.moverAErrores(ruta, err.message);
          console.error(`❌ Error procesando ${archivo}:`, err.message);
        }
      }
      return resultados;
    } catch (error) {
      console.error('❌ Error leyendo directorio:', error.message);
      throw error;
    }
  }

  async generarReporte(resultados) {
    if (resultados.length === 0) {
      console.log('ℹ️ No hay resultados para generar reporte.');
      return;
    }

    const reporte = {
      fechaGeneracion: new Date().toISOString(),
      totalArchivos: resultados.length,
      estadisticasGlobales: {
        totalPalabras: resultados.reduce((s, r) => s + r.palabras, 0),
        totalCaracteres: resultados.reduce((s, r) => s + r.caracteres, 0),
        promedioPalabras: Math.round(resultados.reduce((s, r) => s + r.palabras, 0) / resultados.length)
      },
      detalleArchivos: resultados
    };

    const rutaReporte = path.join(this.directorioBase, 'reporte-procesamiento.json');
    await fs.writeFile(rutaReporte, JSON.stringify(reporte, null, 2));
    console.log('📊 Reporte generado:', rutaReporte);
    return reporte;
  }

  async buscarTexto(palabraClave) {
    if (this.index.size === 0) {
      await this.actualizarIndice();
    }

    const regex = new RegExp(palabraClave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const resultados = [];

    for (const [archivo, data] of this.index) {
      const lineas = data.contenido.split('\n');
      lineas.forEach((linea, i) => {
        if (regex.test(linea)) {
          resultados.push({
            archivo,
            linea: i + 1,
            texto: linea.trim()
          });
        }
      });
    }

    if (resultados.length === 0) {
      console.log(`🔍 No se encontraron coincidencias para "${palabraClave}"`);
    } else {
      console.log(`🔍 ${resultados.length} coincidencia(s) para "${palabraClave}":`);
      resultados.forEach(r => {
        const preview = r.texto.substring(0, 80);
        console.log(`   📄 ${r.archivo} (línea ${r.linea}): ${preview}${r.texto.length > 80 ? '...' : ''}`);
      });
    }
    return resultados;
  }
}

// ===================
// CLI Interactiva
// ===================
async function cli() {
  const procesador = new ProcesadorArchivos('./demo-archivos');
  await procesador.inicializar();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n🖥️  Sistema de Procesamiento de Archivos Node.js - CLI Interactiva');
  console.log('Comandos disponibles:');
  console.log('  procesar          → Procesar todos los archivos y generar reporte');
  console.log('  buscar <texto>    → Buscar texto en todos los archivos indexados');
  console.log('  mayusculas <archivo> → Convertir archivo a mayúsculas');
  console.log('  copiar <origen> <destino> → Copiar usando streams');
  console.log('  list              → Listar archivos en el directorio base');
  console.log('  help              → Mostrar esta ayuda');
  console.log('  salir             → Salir\n');

  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', async (input) => {
    const args = input.trim().split(' ');
    const comando = args[0].toLowerCase();
    const params = args.slice(1);

    try {
      switch (comando) {
        case 'procesar':
          const resultados = await procesador.procesarDirectorio();
          if (resultados.length > 0) await procesador.generarReporte(resultados);
          break;

        case 'buscar':
          if (params.length === 0) return console.log('❌ Uso: buscar <palabra o frase>');
          await procesador.buscarTexto(params.join(' '));
          break;

        case 'mayusculas':
          if (params.length < 1) return console.log('❌ Uso: mayusculas <archivo.txt>');
          const archivoIn = path.join(procesador.directorioBase, params[0]);
          const archivoOut = path.join(procesador.directorioBase, params[0].replace(/\.txt$/, '-MAYUS.txt'));
          await procesador.convertirAMayusculas(archivoIn, archivoOut);
          break;

        case 'copiar':
          if (params.length < 2) return console.log('❌ Uso: copiar <origen> <destino>');
          const origen = path.join(procesador.directorioBase, params[0]);
          const destino = path.join(procesador.directorioBase, params[1]);
          await procesador.copiarArchivoStreams(origen, destino);
          break;

        case 'list':
          const archivos = await fs.readdir(procesador.directorioBase);
          console.log('📁 Contenido del directorio base:');
          archivos.forEach(a => console.log(`   ${a}`));
          break;

        case 'help':
          console.log('Comandos disponibles:');
          console.log('  procesar | buscar <texto> | mayusculas <archivo> | copiar <origen> <destino> | list | help | salir');
          break;

        case 'salir':
          console.log('👋 ¡Hasta luego!');
          rl.close();
          return;

        default:
          console.log('❌ Comando no reconocido. Escribe "help" para ver opciones.');
      }
    } catch (err) {
      console.error('❌ Error ejecutando comando:', err.message);
    }

    rl.prompt();
  });

  rl.on('close', () => process.exit(0));
}

// Ejecutar CLI por defecto
cli();