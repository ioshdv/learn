// sistema-figuras.js

class FiguraGeometrica {
  constructor(nombre) {
    if (!nombre) throw new Error("Nombre requerido");
    this.nombre = nombre;
  }
  calcularArea() { throw new Error("Implementar área"); }
  calcularPerimetro() { throw new Error("Implementar perímetro"); }
  calcularVolumen() { return 0; }
  describir() {
    const vol = this.calcularVolumen() > 0 ? `, Volumen: ${this.calcularVolumen()}` : "";
    return `${this.nombre} → Área: ${this.calcularArea().toFixed(2)}, Perímetro: ${this.calcularPerimetro().toFixed(2)}${vol}`;
  }
  esSimilar(otra) { return this.nombre === otra.nombre; }
  dibujar() { console.log(`[${this.nombre}]`); }
}

class Circulo extends FiguraGeometrica {
  constructor(radio) {
    if (radio <= 0) throw new Error("Radio > 0");
    super("Círculo"); this.radio = radio;
  }
  calcularArea() { return Math.PI * this.radio ** 2; }
  calcularPerimetro() { return 2 * Math.PI * this.radio; }
  dibujar() { console.log("  ***  \n *   * \n  ***  "); }
}

class Pentagono extends FiguraGeometrica {
  constructor(lado) {
    if (lado <= 0) throw new Error("Lado > 0");
    super("Pentágono"); this.lado = lado;
  }
  calcularArea() { return (1/4) * Math.sqrt(5*(5+2*Math.sqrt(5))) * this.lado**2; }
  calcularPerimetro() { return 5 * this.lado; }
  dibujar() { console.log("   /\\   \n  /  \\  \n /____\\ "); }
}

class Hexagono extends FiguraGeometrica {
  constructor(lado) {
    if (lado <= 0) throw new Error("Lado > 0");
    super("Hexágono"); this.lado = lado;
  }
  calcularArea() { return (3*Math.sqrt(3)/2) * this.lado**2; }
  calcularPerimetro() { return 6 * this.lado; }
}

class Cubo extends FiguraGeometrica {
  constructor(lado) {
    if (lado <= 0) throw new Error("Lado > 0");
    super("Cubo"); this.lado = lado;
  }
  calcularArea() { return 6 * this.lado**2; }
  calcularPerimetro() { return 12 * this.lado; }
  calcularVolumen() { return this.lado**3; }
}

// Factory
const F = {
  crear(tipo, ...args) {
    const clases = { circulo: Circulo, pentagono: Pentagono, hexagono: Hexagono, cubo: Cubo };
    const C = clases[tipo];
    if (!C) throw new Error("Tipo desconocido");
    return new C(...args);
  }
};

// Singleton
class Coleccion {
  static instancia = null;
  constructor() {
    if (Coleccion.instancia) return Coleccion.instancia;
    this.figuras = [];
    Coleccion.instancia = this;
  }
  agregar(f) { this.figuras.push(f); }
  listar() {
    console.log("\n=== FIGURAS ===");
    this.figuras.forEach((f,i) => console.log(`${i+1}. ${f.describir()}`));
  }
  static get() { return new Coleccion(); }
}

// Demo
const c = Coleccion.get();
c.agregar(F.crear("circulo", 3));
c.agregar(F.crear("pentagono", 4));
c.agregar(F.crear("hexagono", 3));
c.agregar(F.crear("cubo", 5));

c.listar();
console.log("\nSimilitud →", F.crear("hexagono",1).esSimilar(F.crear("hexagono",100)));
console.log("\nDibujos:");
c.figuras.forEach(f => f.dibujar());