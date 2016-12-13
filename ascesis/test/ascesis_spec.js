import { BaseComponent, BaseController } from '../src/ascesis';

describe('Single component functionality', (done) => {

  let component;

  customElements.define('my-test-component', BaseComponent);

  before((done) => {
    customElements.whenDefined('my-test-component').then(() => {
      component = document.createElement('my-test-component');
      done();
    });
  });

  it('html function works correctly', () => {
    const fixture = `
      <div class="foo" data-test="bar">
        <div>
          <span>test</span>
        </div>
      </div>
      <div>
        test 2
      </div>
    `;
    component.html(fixture);
    assert.equal(component.innerHTML, fixture);
  });

  it('toggles debug class correctly', () => {
    component.toggleHighlight();
    assert.equal(component.classList.contains('component-highlighted'), true);
    component.toggleHighlight();
    assert.equal(component.classList.contains('component-highlighted'), false);
  });

  it('triggers events correctly', () => {
    let handler = chai.spy(() => {});
    component.addEventListener('test-event', handler);
    component.trigger('test-event');
    expect(handler).to.have.been.called.once;
  });

  it('passes event data correctly', () => {
    let data;
    let handler = chai.spy(({eventData}) => { data = eventData });
    component.addEventListener('test-event', handler);
    component.trigger('test-event', { foo: 'bar' });
    assert.deepEqual(data, { foo: 'bar' });
  });

});


describe('Complex functionality', (done) => {

  class RootController extends BaseController {}
  class ChildController extends BaseController {}
  class ComponentOne extends BaseComponent {}
  class ComponentTwo extends BaseComponent {}
  class ComponentThree extends BaseComponent {}

  customElements.define('root-controller', RootController);
  customElements.define('child-controller', ChildController);
  customElements.define('component-one', ComponentOne);
  customElements.define('component-two', ComponentTwo);
  customElements.define('component-three', ComponentThree);

  let container = document.createElement('div');

  before((done) => {
    let promises = [
      'root-controller',
      'child-controller',
      'component-one',
      'component-two',
      'component-three'
    ].map((component_name) => {
      return customElements.whenDefined(component_name);
    ));
    Promise.all(promises).then(done);
  });

});
