import { BaseComponent } from '../src/ascesis';

describe('Single component functionality', (done) => {

  const container = document.createElement('div');
  let component;

  customElements.define('my-test-component', BaseComponent);

  before((done) => {
    customElements.whenDefined('my-test-component').then(() => {
      component = document.createElement('my-test-component');
      container.appendChild(component);
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
    let handler = chai.spy(() => { console.log(234234); });
    container.addEventListener('test-event', handler);
    //component.trigger('test-event');
    //console.log(container.innerHTML);
    //expect(handler).to.have.been.called.once;
  });

});
