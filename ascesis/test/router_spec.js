import Router from '../src/router';


describe('Base functionality', () => {
  before(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
  });

  after(() => {
    //set initial url to /
    window.history.replaceState(null, null, '/');
  });

  const router = new Router();

  it('returns root correctly', () => {
    assert.equal(router.root, '');
  });

  it('matches root correctly', () => {
    assert.equal(router.root_matches, true);
  });

  it('returns query string correctly', () => {
    assert.equal(router.qs, false);
  });

  it('returns query params correctly', () => {
    assert.deepEqual(router.params, {});
  });

  it('returns absolute path correctly', () => {
    assert.equal(router.global_path, '/');
  });

  it('returns relative path correctly', () => {
    assert.equal(router.path, '/');
  });

  it('adds handlers correctly', () => {
    let handler = () => {};
    router.add('/', handler);
    assert.equal(router.listeners.length, 1);
    assert.equal(router.listeners[0].callback, handler);
  });

  it('navigates correctly', () => {
    router.navigate('/bar');
    assert.equal(router.path, '/bar');
  });

  it('handles route correctly', () => {
    let handler = chai.spy(() => {});
    router.add('/foo', handler);
    router.navigate('/foo');
    expect(handler).to.have.been.called.once;
  });

  it('destroys correctly', () => {
    let handler = chai.spy(() => {});
    router.add('/bar', handler);
    router.destroy();
    router.navigate('/bar');
    expect(handler).not.to.have.been.called.once;
    assert.deepEqual(router.listeners, []);
  });
});

describe('Mount on subpath', () => {
});

describe('Routes handling', () => {
});

describe('Multiple Routers', () => {
});
