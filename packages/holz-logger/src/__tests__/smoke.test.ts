it('passes smoke checks', async () => {
  await expect(import('../index.browser')).resolves.toBeDefined();
  await expect(import('../index.node')).resolves.toBeDefined();
});
