import Router from 'src/router';

//set initial url to /
window.history.replaceState(null, null, '/');

describe("Base functionality", () => {
  const router = new Router();
  it('returns root correctly', () => {
    assert.equal(router.root, '');
  });
  it('returns query params correctly', () => {
    assert.deepEqual(router.params, {});
  });
});
