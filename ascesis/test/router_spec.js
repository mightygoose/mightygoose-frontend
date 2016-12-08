import Router from 'src/router';

//set initial url to /
window.history.replaceState(null, null, '/');

describe("Base functionality", () => {
  const router = new Router();
  it('returns root correctly', () => {
    expect(router.root).to.be.equal('');
  });
  it('returns query params correctly', () => {
    expect(router.params).to.deep.equal({});
  });
});
