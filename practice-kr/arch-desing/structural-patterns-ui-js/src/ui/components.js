class UIComponent {
  render() {
    throw new Error('Implement in subclass');
  }

  add() {
    throw new Error('No se puede agregar a hoja');
  }

  remove() {
    throw new Error('No se puede remover de hoja');
  }

  getChildren() {
    return [];
  }
}

class Button extends UIComponent {
  constructor(text) {
    super();
    this.text = text;
  }

  render() {
    return `<button>${this.text}</button>`;
  }
}

class Container extends UIComponent {
  constructor(cssClass = 'container') {
    super();
    this.cssClass = cssClass;
    this.children = [];
  }

  add(component) {
    this.children.push(component);
  }

  remove(component) {
    const index = this.children.indexOf(component);
    if (index > -1) this.children.splice(index, 1);
  }

  getChildren() {
    return [...this.children];
  }

  render() {
    const childrenHtml = this.children.map((child) => child.render()).join('');
    return `<div class="${this.cssClass}">${childrenHtml}</div>`;
  }
}

module.exports = {
  UIComponent,
  Button,
  Container
};
