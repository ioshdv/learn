console.log("=== SISTEMA DE GESTIÓN DE BIBLIOTECA EXTENDIDO ===\n");

// Base de datos de libros con títulos simples y naturales
const libros = [
  { id: 1, titulo: "Aprender JS", autor: "Ana", genero: "Programación", disponible: true, prestamos: 0 },
  { id: 2, titulo: "Código Fácil", autor: "Luis", genero: "Programación", disponible: false, prestamos: 3 },
  { id: 3, titulo: "Juegos de Código", autor: "Marta", genero: "Programación", disponible: true, prestamos: 2 },
  { id: 4, titulo: "Aventuras en el Parque", autor: "Pedro", genero: "Ficción", disponible: true, prestamos: 1 },
  { id: 5, titulo: "Historias de Amigos", autor: "Sofía", genero: "Ficción", disponible: false, prestamos: 4 }
];

// Sistema de usuarios
const usuarios = [
  { id: 1, nombre: "Ana", prestamos: [] },
  { id: 2, nombre: "Luis", prestamos: [] },
  { id: 3, nombre: "Marta", prestamos: [] }
];

// Sistema de gestión
const biblioteca = {
  obtenerDisponibles() {
    return libros.filter(({ disponible }) => disponible);
  },

  buscarAvanzado({ titulo = "", autor = "", genero = "" }) {
    return libros.filter(libro => 
      libro.titulo.toLowerCase().includes(titulo.toLowerCase()) &&
      libro.autor.toLowerCase().includes(autor.toLowerCase()) &&
      libro.genero.toLowerCase().includes(genero.toLowerCase())
    );
  },

  prestarLibro(idLibro, idUsuario) {
    const libro = libros.find(l => l.id === idLibro);
    const usuario = usuarios.find(u => u.id === idUsuario);

    if (!libro) return "Libro no encontrado";
    if (!usuario) return "Usuario no encontrado";
    if (!libro.disponible) return "Libro no disponible";

    libro.disponible = false;
    libro.prestamos++;
    usuario.prestamos.push({ libroId: idLibro, fechaPrestamo: new Date(), devuelto: false });

    return `✅ ${usuario.nombre} ha prestado "${libro.titulo}"`;
  },

  devolverLibro(idLibro, idUsuario) {
    const libro = libros.find(l => l.id === idLibro);
    const usuario = usuarios.find(u => u.id === idUsuario);

    if (!libro) return "Libro no encontrado";
    if (!usuario) return "Usuario no encontrado";

    const registro = usuario.prestamos.find(p => p.libroId === idLibro && !p.devuelto);
    if (!registro) return "Este usuario no tiene este libro prestado";

    libro.disponible = true;
    registro.devuelto = true;
    registro.fechaDevolucion = new Date();

    const diasPrestamo = Math.floor((registro.fechaDevolucion - registro.fechaPrestamo) / (1000 * 60 * 60 * 24));
    const multa = diasPrestamo > 7 ? diasPrestamo - 7 : 0;

    return `✅ Libro "${libro.titulo}" devuelto. Multa: $${multa}`;
  },

  reportePopularidad() {
    return libros
      .map(({ titulo, prestamos }) => ({ titulo, prestamos }))
      .sort((a, b) => b.prestamos - a.prestamos);
  }
};

// --- DEMOSTRACIÓN PRÁCTICA --- //
console.log("📚 LIBROS DISPONIBLES:");
biblioteca.obtenerDisponibles().forEach(({ titulo }) => console.log(`- ${titulo}`));

console.log("\n🔍 BÚSQUEDA AVANZADA (Programación y Ana):");
biblioteca.buscarAvanzado({ autor: "Ana", genero: "Programación" })
  .forEach(({ titulo, autor }) => console.log(`- ${titulo} por ${autor}`));

console.log("\n📖 PRÉSTAMOS:");
console.log(biblioteca.prestarLibro(3, 1));
console.log(biblioteca.prestarLibro(3, 2)); // No disponible

console.log("\n📖 DEVOLUCIONES:");
console.log(biblioteca.devolverLibro(3, 1));

console.log("\n🏆 LIBROS MÁS POPULARES:");
biblioteca.reportePopularidad().forEach(({ titulo, prestamos }) => {
  console.log(`${titulo}: ${prestamos} préstamos`);
});
