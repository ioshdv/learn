const { Character } = require('../src/game/character');
const { CharacterFactory } = require('../src/game/characterFactory');
const { CharacterBuilder } = require('../src/game/characterBuilder');

describe('Game - Builder + Factory (+ Prototype)', () => {
  test('builder genera customizations y no comparte referencias de stats', () => {
    const b1 = new CharacterBuilder().setName('A').setHp(200).setAttack(30).build();
    const b2 = new CharacterBuilder().setName('B').setHp(90).setAttack(5).build();

    // mutar b1.stats no debe afectar b2.stats
    b1.stats.hp = 999;

    expect(b2.stats.hp).toBe(90);
    expect(b2.stats.attack).toBe(5);
  });

  test('factory aplica customizations del builder sin afectar prototipo', () => {
    const factory = new CharacterFactory();

    const warriorProto = new Character('Warrior', 'Fighter');
    warriorProto.stats = { hp: 150, mp: 20, attack: 15 };
    factory.registerPrototype('warrior', warriorProto);

    const custom = new CharacterBuilder()
      .setName('Conan')
      .setLevel(7)
      .setHp(180)
      .setAttack(22)
      .build();

    const player = factory.createCharacter('warrior', custom);

    expect(player.name).toBe('Conan');
    expect(player.level).toBe(7);
    expect(player.stats.hp).toBe(180);
    expect(player.stats.attack).toBe(22);

    // prototipo intacto
    expect(warriorProto.name).toBe('Warrior');
    expect(warriorProto.level).toBe(1);
    expect(warriorProto.stats.hp).toBe(150);
    expect(warriorProto.stats.attack).toBe(15);
  });

  test('builder no pisa defaults si no define campos', () => {
    const factory = new CharacterFactory();

    const mageProto = new Character('Mage', 'Caster');
    mageProto.stats = { hp: 80, mp: 100, attack: 5 };
    factory.registerPrototype('mage', mageProto);

    const custom = new CharacterBuilder().setName('Merlin').build();
    const player = factory.createCharacter('mage', custom);

    expect(player.name).toBe('Merlin');
    expect(player.level).toBe(1); // default del prototipo/clon
    expect(player.stats.mp).toBe(100);
  });
});
