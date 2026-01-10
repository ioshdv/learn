class LegacyHtmlButton {
  constructor(label) {
    this.label = label;
  }

  toHtml() {
    return `<button>${this.label}</button>`;
  }
}

module.exports = { LegacyHtmlButton };
