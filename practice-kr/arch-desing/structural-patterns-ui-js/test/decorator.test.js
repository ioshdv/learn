const test = require('node:test');
const assert = require('node:assert/strict');
const { Button } = require('../src/ui/components');
const { CssClassDecorator, DisabledDecorator, TooltipDecorator } = require('../src/decorator/decorators');

test('Decorator composes button features', () => {
  const base = new Button('Click');
  const decorated = new DisabledDecorator(
    new TooltipDecorator(
      new CssClassDecorator(base, 'primary'),
      'Hello'
    )
  );

  assert.equal(decorated.render(), '<button disabled class="primary" title="Hello">Click</button>');
});
