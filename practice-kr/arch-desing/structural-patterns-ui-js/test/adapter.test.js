const test = require('node:test');
const assert = require('node:assert/strict');
const { LegacyHtmlButton } = require('../src/adapter/legacy-html-button');
const { ButtonAdapter } = require('../src/adapter/button-adapter');

test('Adapter exposes render() for legacy button', () => {
  const legacy = new LegacyHtmlButton('Pay');
  const adapted = new ButtonAdapter(legacy);

  assert.equal(adapted.render(), '<button>Pay</button>');
});
