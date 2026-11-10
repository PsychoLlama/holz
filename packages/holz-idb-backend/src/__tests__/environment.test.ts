// Placeholder: only verifies Chromium-based tests work in CI.
describe('test environment', () => {
  it('provides IndexedDB', () => {
    expect(window).toHaveProperty('indexedDB');
  });
});
