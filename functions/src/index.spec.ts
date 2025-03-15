describe('semanticPrs', () => {
  it('should use the europe-west2 region', () => {
    const onRequest = jest.fn();
    jest.mock('firebase-functions/https', () => ({
      onRequest,
    }));
    jest.mock('probot', () => ({
      createNodeMiddleware: jest.fn(),
      createProbot: jest.fn(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./index');

    expect(onRequest).toHaveBeenCalledWith({ region: 'europe-west2' }, expect.any(Function));
  });
});
