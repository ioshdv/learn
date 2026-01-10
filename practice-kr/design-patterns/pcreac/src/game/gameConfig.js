class GameConfig {
  static #instance = null;

  constructor() {
    if (GameConfig.#instance) return GameConfig.#instance;

    this.settings = {
      difficulty: 'normal',
      maxPartySize: 4,
    };

    GameConfig.#instance = this;
  }

  static getInstance() {
    if (!GameConfig.#instance) GameConfig.#instance = new GameConfig();
    return GameConfig.#instance;
  }

  set(key, value) {
    this.settings[key] = value;
  }

  get(key) {
    return this.settings[key];
  }
}

module.exports = { GameConfig };
