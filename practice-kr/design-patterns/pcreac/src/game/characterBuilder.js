class CharacterBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this._data = {
      name: undefined,
      classType: undefined,
      level: undefined,
      stats: undefined,
    };
    return this;
  }

  setName(name) {
    this._data.name = name;
    return this;
  }

  setClassType(classType) {
    this._data.classType = classType;
    return this;
  }

  setLevel(level) {
    this._data.level = level;
    return this;
  }

  setStats(stats) {
    // Copia defensiva para evitar referencias compartidas
    this._data.stats = { ...stats };
    return this;
  }

  setHp(hp) {
    this._data.stats = { ...(this._data.stats || {}), hp };
    return this;
  }

  setMp(mp) {
    this._data.stats = { ...(this._data.stats || {}), mp };
    return this;
  }

  setAttack(attack) {
    this._data.stats = { ...(this._data.stats || {}), attack };
    return this;
  }

  build() {
    // Retorna solo campos definidos (no pisa defaults del clon con undefined)
    const out = {};
    for (const [k, v] of Object.entries(this._data)) {
      if (v !== undefined) out[k] = k === 'stats' ? { ...v } : v;
    }
    return out;
  }
}

module.exports = { CharacterBuilder };
