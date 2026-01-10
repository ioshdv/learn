const { Button, Container } = require('../ui/components');
const { LegacyHtmlButton } = require('../adapter/legacy-html-button');
const { ButtonAdapter } = require('../adapter/button-adapter');
const {
  CssClassDecorator,
  DisabledDecorator,
  TooltipDecorator
} = require('../decorator/decorators');

class UIFacade {
  createHeader(items) {
    const header = new Container('header');
    items.forEach((text) => header.add(new Button(text)));
    return header;
  }

  createLegacyButton(label) {
    return new ButtonAdapter(new LegacyHtmlButton(label));
  }

  decorateButton(button, { cssClass, disabled, tooltip } = {}) {
    let current = button;

    if (cssClass) current = new CssClassDecorator(current, cssClass);
    if (tooltip) current = new TooltipDecorator(current, tooltip);
    if (disabled) current = new DisabledDecorator(current);

    return current;
  }

  createPage({ headerItems, mainButtonText, legacyLabel }) {
    const page = new Container('page');

    const header = this.createHeader(headerItems);
    page.add(header);

    const main = new Container('main');
    const baseButton = new Button(mainButtonText);

    const decorated = this.decorateButton(baseButton, {
      cssClass: 'primary',
      tooltip: 'Main action'
    });

    main.add(decorated);
    main.add(this.createLegacyButton(legacyLabel));

    page.add(main);
    return page;
  }
}

module.exports = { UIFacade };
