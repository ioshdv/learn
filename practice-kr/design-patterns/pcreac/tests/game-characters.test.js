const { Character } = require('../src/game/character');
const { CharacterFactory } = require('../src/game/characterFactory');

describe('Ejercicio - Factory + Prototype', () => {
  test('crea personajes desde prototipos y no se afectan entre sí', () => {
    const factory = new CharacterFactory();

    const warriorProto = new Character('Warrior', 'Fighter');
    warriorProto.stats = { hp: 150, mp: 20, attack: 15 };

    const mageProto = new Character('Mage', 'Caster');
    mageProto.stats = { hp: 80, mp: 100, attack: 5 };

    factory.registerPrototype('warrior', warriorProto);
    factory.registerPrototype('mage', mageProto);

    const player1 = factory.createCharacter('warrior', { name: 'Conan' });
    const player2 = factory.createCharacter('mage', { name: 'Merlin' });

    player1.levelUp();

    expect(player1.name).toBe('Conan');
    expect(player1.stats.hp).toBe(170);

    expect(player2.name).toBe('Merlin');
    expect(player2.stats.hp).toBe(80); // no afectado
  });

  test('lanza error si el tipo no está registrado', () => {
    const factory = new CharacterFactory();
    expect(() => factory.createCharacter('archer')).toThrow('Tipo no registrado');
  });

  test('customizations no rompen el prototipo', () => {
    const factory = new CharacterFactory();
    const proto = new Character('Warrior', 'Fighter');
    proto.stats = { hp: 150, mp: 20, attack: 15 };

    factory.registerPrototype('warrior', proto);

    const p = factory.createCharacter('warrior', { name: 'X', level: 10 });
    expect(p.level).toBe(10);

    // prototipo intacto
    expect(proto.level).toBe(1);
    expect(proto.name).toBe('Warrior');
  });
});
