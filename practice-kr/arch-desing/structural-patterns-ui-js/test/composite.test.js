const test = require('node:test');
const assert = require('node:assert/strict');
const { Container, Button } = require('../src/ui/components');

test('Composite renders nested containers', () => {
  const main = new Container();
  const header = new Container();

  header.add(new Button('Home'));
  header.add(new Button('About'));

  main.add(header);
  main.add(new Button('Contact'));

  assert.equal(
    main.render(),
    '<div class="container"><div class="container"><button>Home</button><button>About</button></div><button>Contact</button></div>'
  );
});
