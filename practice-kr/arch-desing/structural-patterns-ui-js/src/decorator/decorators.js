const { UIComponent } = require('../ui/components');

function normalizeButtonOpenTag(html, updates) {
  // Espera algo tipo: <button ...>TEXT</button>
  const match = html.match(/^<button([^>]*)>([\s\S]*)<\/button>$/);
  if (!match) return html;

  const attrsRaw = match[1] || '';
  const inner = match[2];

  const attrs = {};

  // Parseo simple de atributos: key="value" o booleanos (disabled)
  const attrRegex = /(\w+)(?:="([^"]*)")?/g;
  let m;
  while ((m = attrRegex.exec(attrsRaw)) !== null) {
    const key = m[1];
    const val = m[2];
    attrs[key] = val === undefined ? true : val;
  }

  // Aplicar updates
  Object.entries(updates).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    attrs[k] = v;
  });

  // Reconstrucción con orden determinista
  // disabled primero, luego class, luego title (para que el test sea estable)
  const parts = [];

  if (attrs.disabled) parts.push('disabled');
  if (typeof attrs.class === 'string') parts.push(`class="${attrs.class}"`);
  if (typeof attrs.title === 'string') parts.push(`title="${attrs.title}"`);

  // Agregar cualquier otro atributo no contemplado (orden alfabético)
  const known = new Set(['disabled', 'class', 'title']);
  const others = Object.keys(attrs)
    .filter((k) => !known.has(k))
    .sort();

  for (const k of others) {
    const v = attrs[k];
    if (v === true) parts.push(k);
    else parts.push(`${k}="${String(v)}"`);
  }

  const open = parts.length ? `<button ${parts.join(' ')}>` : '<button>';
  return `${open}${inner}</button>`;
}

class ComponentDecorator extends UIComponent {
  constructor(component) {
    super();
    this.component = component;
  }

  render() {
    return this.component.render();
  }
}

class CssClassDecorator extends ComponentDecorator {
  constructor(component, cssClass) {
    super(component);
    this.cssClass = cssClass;
  }

  render() {
    const html = super.render();
    return normalizeButtonOpenTag(html, { class: this.cssClass });
  }
}

class DisabledDecorator extends ComponentDecorator {
  render() {
    const html = super.render();
    return normalizeButtonOpenTag(html, { disabled: true });
  }
}

class TooltipDecorator extends ComponentDecorator {
  constructor(component, tooltip) {
    super(component);
    this.tooltip = tooltip;
  }

  render() {
    const html = super.render();
    return normalizeButtonOpenTag(html, { title: this.tooltip });
  }
}

module.exports = {
  ComponentDecorator,
  CssClassDecorator,
  DisabledDecorator,
  TooltipDecorator
};
