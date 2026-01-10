class CharacterFactory {
  constructor() {
    this.prototypes = {};
  }

  registerPrototype(type, prototype) {
    this.prototypes[type] = prototype;
  }

  createCharacter(type, customizations = {}) {
    const prototype = this.prototypes[type];
    if (!prototype) throw new Error('Tipo no registrado');

    const character = prototype.clone();
    Object.assign(character, customizations);
    return character;
  }
}

module.exports = { CharacterFactory };
