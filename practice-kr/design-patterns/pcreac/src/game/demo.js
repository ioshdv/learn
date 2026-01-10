const { Character } = require('./character');
const { CharacterFactory } = require('./characterFactory');
const { CharacterBuilder } = require('./characterBuilder');
const { GameConfig } = require('./gameConfig');

function runDemo() {
  // Singleton
  const cfg = GameConfig.getInstance();
  cfg.set('difficulty', 'hard');

  // Factory + Prototype (prototipos)
  const factory = new CharacterFactory();

  const warriorProto = new Character('Warrior', 'Fighter');
  warriorProto.stats = { hp: 150, mp: 20, attack: 15 };

  const mageProto = new Character('Mage', 'Caster');
  mageProto.stats = { hp: 80, mp: 100, attack: 5 };

  factory.registerPrototype('warrior', warriorProto);
  factory.registerPrototype('mage', mageProto);

  // Builder (customizations)
  const player1Custom = new CharacterBuilder()
    .setName('Conan')
    .setLevel(1)
    .setHp(150)
    .setAttack(15)
    .build();

  const player2Custom = new CharacterBuilder()
    .setName('Merlin')
    .setLevel(1)
    .setHp(80)
    .setMp(100)
    .setAttack(5)
    .build();

  // Factory crea clones + aplica customizations
  const player1 = factory.createCharacter('warrior', player1Custom);
  const player2 = factory.createCharacter('mage', player2Custom);

  // acción
  player1.levelUp();

  return {
    difficulty: cfg.get('difficulty'),
    player1,
    player2,
  };
}

module.exports = { runDemo };
