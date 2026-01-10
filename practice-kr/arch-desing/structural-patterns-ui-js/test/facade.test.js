const test = require('node:test');
const assert = require('node:assert/strict');
const { UIFacade } = require('../src/facade/ui-facade');

test('Facade builds a full page with simple input', () => {
  const facade = new UIFacade();
  const page = facade.createPage({
    headerItems: ['Home', 'About'],
    mainButtonText: 'Contact',
    legacyLabel: 'Legacy'
  });

  const html = page.render();
  assert.ok(html.includes('class="page"'));
  assert.ok(html.includes('class="header"'));
  assert.ok(html.includes('class="main"'));
  assert.ok(html.includes('<button>Legacy</button>'));
});
