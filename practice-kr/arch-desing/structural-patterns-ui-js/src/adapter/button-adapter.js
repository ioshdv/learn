const { UIComponent } = require('../ui/components');

class ButtonAdapter extends UIComponent {
  constructor(legacyButton) {
    super();
    this.legacyButton = legacyButton;
  }

  render() {
    return this.legacyButton.toHtml();
  }
}

module.exports = { ButtonAdapter };
