// sistema-academico.js
//SISTEMA ACADEMICO

// Base de datos de estudiantes
const estudiantes = [
  {
    id: 1,
    nombre: 'Ana García',
    edad: 22,
    carrera: 'Ingeniería Informática',
    calificaciones: [
      { asignatura: 'Matemáticas', nota: 8.5, creditos: 6 },
      { asignatura: 'Programación', nota: 9.0, creditos: 8 },
      { asignatura: 'Bases de Datos', nota: 7.5, creditos: 4 }
    ],
    activo: true
  },
  {
    id: 2,
    nombre: 'Carlos López',
    edad: 24,
    carrera: 'Ingeniería Informática',
    calificaciones: [
      { asignatura: 'Matemáticas', nota: 6.0, creditos: 6 },
      { asignatura: 'Programación', nota: 8.5, creditos: 8 },
      { asignatura: 'Redes', nota: 7.0, creditos: 5 }
    ],
    activo: true
  },
  {
    id: 3,
    nombre: 'María Rodríguez',
    edad: 21,
    carrera: 'Arquitectura',
    calificaciones: [
      { asignatura: 'Dibujo Técnico', nota: 9.5, creditos: 4 },
      { asignatura: 'Historia del Arte', nota: 8.0, creditos: 3 }
    ],
    activo: false
  }
];

// Analizador académico
const AnalizadorAcademico = {
  calcularPromedioPonderado(estudiante) {
    const { calificaciones } = estudiante;
    const totalCreditos = calificaciones.reduce((sum, cal) => sum + cal.creditos, 0);
    const sumaPonderada = calificaciones.reduce((sum, cal) => sum + cal.nota * cal.creditos, 0);
    return totalCreditos > 0 ? sumaPonderada / totalCreditos : 0;
  },

  mejoresPorCarrera(estudiantes, limite = 3) {
    const porCarrera = estudiantes.reduce((grupos, estudiante) => {
      const carrera = estudiante.carrera;
      if (!grupos[carrera]) grupos[carrera] = [];
      grupos[carrera].push({ ...estudiante, promedio: this.calcularPromedioPonderado(estudiante) });
      return grupos;
    }, {});

    const resultado = {};
    for (const [carrera, estudiantesCarrera] of Object.entries(porCarrera)) {
      resultado[carrera] = estudiantesCarrera
        .sort((a, b) => b.promedio - a.promedio)
        .slice(0, limite);
    }
    return resultado;
  },

  analizarAsignaturas(estudiantes) {
    const todasCalificaciones = estudiantes.flatMap(estudiante =>
      estudiante.calificaciones.map(cal => ({
        asignatura: cal.asignatura,
        nota: cal.nota,
        estudiante: estudiante.nombre,
        carrera: estudiante.carrera
      }))
    );

    const porAsignatura = todasCalificaciones.reduce((grupos, cal) => {
      const asignatura = cal.asignatura;
      if (!grupos[asignatura]) grupos[asignatura] = [];
      grupos[asignatura].push(cal);
      return grupos;
    }, {});

    return Object.entries(porAsignatura).map(([asignatura, calificaciones]) => {
      const notas = calificaciones.map(c => c.nota);
      const promedio = notas.reduce((sum, n) => sum + n, 0) / notas.length;
      return {
        asignatura,
        promedio: Math.round(promedio * 100) / 100,
        estudiantes: calificaciones.length,
        maxNota: Math.max(...notas),
        minNota: Math.min(...notas),
        carreras: [...new Set(calificaciones.map(c => c.carrera))]
      };
    });
  },

  generarReporte(estudiante) {
    const promedio = this.calcularPromedioPonderado(estudiante);
    const { nombre, edad, carrera, activo, calificaciones: [primeraCalificacion, segundaCalificacion, ...restoCalificaciones] = [] } = estudiante;

    return {
      estudiante: { nombre, edad, carrera, activo },
      rendimiento: {
        promedio,
        totalAsignaturas: estudiante.calificaciones.length,
        mejorNota: Math.max(...estudiante.calificaciones.map(c => c.nota)),
        peorNota: Math.min(...estudiante.calificaciones.map(c => c.nota)),
        asignaturasAprobadas: estudiante.calificaciones.filter(c => c.nota >= 7).length
      },
      detalle: {
        primeraAsignatura: primeraCalificacion,
        segundaAsignatura: segundaCalificacion,
        otrasAsignaturas: restoCalificaciones.length
      }
    };
  }
};

// DEMOSTRACIÓN

console.log('🎓 SISTEMA DE ANÁLISIS ACADÉMICO\n');

const promedios = estudiantes.map(estudiante => ({
  nombre: estudiante.nombre,
  promedio: Math.round(AnalizadorAcademico.calcularPromedioPonderado(estudiante) * 100) / 100
}));

console.log('📊 PROMEDIOS INDIVIDUALES:');
promedios.forEach(({ nombre, promedio }) => console.log(`${nombre}: ${promedio}`));

console.log('\n🏆 MEJORES ESTUDIANTES POR CARRERA:');
const mejores = AnalizadorAcademico.mejoresPorCarrera(estudiantes, 2);
Object.entries(mejores).forEach(([carrera, estudiantesCarrera]) => {
  console.log(`\n${carrera}:`);
  estudiantesCarrera.forEach(({ nombre, promedio }, i) => console.log(`  ${i + 1}. ${nombre} (${promedio})`));
});

console.log('\n📚 ANÁLISIS POR ASIGNATURAS:');
const analisisAsignaturas = AnalizadorAcademico.analizarAsignaturas(estudiantes);
analisisAsignaturas.forEach(a => {
  console.log(`${a.asignatura}: Promedio ${a.promedio}, Rango ${a.minNota}-${a.maxNota}, Estudiantes ${a.estudiantes}, Carreras ${a.carreras.join(', ')}`);
});

console.log('\n📋 INFORME DETALLADO DE ANA GARCÍA:');
console.log(JSON.stringify(AnalizadorAcademico.generarReporte(estudiantes[0]), null, 2));
