const { Container, Button } = require('../ui/components');
const { LegacyHtmlButton } = require('../adapter/legacy-html-button');
const { ButtonAdapter } = require('../adapter/button-adapter');
const { CssClassDecorator, SugarDecorator } = {};
const { CssClassDecorator: Css, DisabledDecorator, TooltipDecorator } = require('../decorator/decorators');
const { UIFacade } = require('../facade/ui-facade');

function compositeOnlyDemo() {
  const mainContainer = new Container();
  const headerContainer = new Container();

  headerContainer.add(new Button('Home'));
  headerContainer.add(new Button('About'));

  mainContainer.add(headerContainer);
  mainContainer.add(new Button('Contact'));

  return mainContainer.render();
}

function adapterDecoratorFacadeDemo() {
  const legacy = new LegacyHtmlButton('Legacy');
  const adapted = new ButtonAdapter(legacy);

  const decorated = new DisabledDecorator(new TooltipDecorator(new Css(adapted, 'legacy'), 'Old API'));

  const facade = new UIFacade();
  const page = facade.createPage({
    headerItems: ['Home', 'About'],
    mainButtonText: 'Contact',
    legacyLabel: 'Legacy'
  });

  return {
    adaptedHtml: decorated.render(),
    pageHtml: page.render()
  };
}

function run() {
  console.log('--- Composite only ---');
  console.log(compositeOnlyDemo());

  console.log('--- Adapter + Decorator + Facade ---');
  const out = adapterDecoratorFacadeDemo();
  console.log(out.adaptedHtml);
  console.log(out.pageHtml);
}

if (require.main === module) run();

module.exports = { compositeOnlyDemo, adapterDecoratorFacadeDemo };
