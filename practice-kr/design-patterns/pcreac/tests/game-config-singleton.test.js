const { GameConfig } = require('../src/game/gameConfig');

describe('Game - Singleton (GameConfig)', () => {
  test('siempre retorna la misma instancia', () => {
    const c1 = GameConfig.getInstance();
    const c2 = GameConfig.getInstance();

    expect(c1).toBe(c2);
  });

  test('estado compartido: cambios persisten entre llamadas', () => {
    const c1 = GameConfig.getInstance();
    c1.set('difficulty', 'hard');

    const c2 = GameConfig.getInstance();
    expect(c2.get('difficulty')).toBe('hard');
  });

  test('tiene valores por defecto', () => {
    const cfg = GameConfig.getInstance();
    expect(cfg.get('maxPartySize')).toBe(4);
  });
});
