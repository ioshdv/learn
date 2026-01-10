class Character {
  constructor(name, classType, level = 1) {
    this.name = name;
    this.classType = classType;
    this.level = level;
    this.stats = { hp: 100, mp: 50, attack: 10 };
  }

  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    // copiar estado completo para que sea un clon real
    cloned.name = this.name;
    cloned.classType = this.classType;
    cloned.level = this.level;
    cloned.stats = { ...this.stats };
    return cloned;
  }

  levelUp() {
    this.level++;
    this.stats.hp += 20;
    this.stats.attack += 2;
  }
}

module.exports = { Character };
