it('passes smoke checks', async () => {
  await expect(import('../index')).resolves.toBeDefined();
  await expect(import('../processor.browser')).resolves.toBeDefined();
  await expect(import('../processor.node')).resolves.toBeDefined();
});
