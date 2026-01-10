const { runDemo } = require('../src/game/demo');
const { GameConfig } = require('../src/game/gameConfig');

describe('Game - Integración (Factory + Builder + Prototype + Singleton)', () => {
  test('demo corre y respeta independencia entre personajes', () => {
    const out = runDemo();

    expect(out.difficulty).toBe('hard');

    // player1 sube nivel
    expect(out.player1.name).toBe('Conan');
    expect(out.player1.stats.hp).toBe(170);

    // player2 no afectado
    expect(out.player2.name).toBe('Merlin');
    expect(out.player2.stats.hp).toBe(80);
  });

  test('singleton persiste entre ejecuciones', () => {
    const cfg1 = GameConfig.getInstance();
    cfg1.set('difficulty', 'normal');

    runDemo(); // lo cambia a hard

    const cfg2 = GameConfig.getInstance();
    expect(cfg2.get('difficulty')).toBe('hard');
  });
});
