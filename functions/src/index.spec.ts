describe('semanticPrs', () => {
  it('should use the europe-west2 region', () => {
    const onRequest = jest.fn();
    jest.mock('firebase-functions/v2/https', () => ({
      onRequest,
    }));
    jest.mock('probot', () => ({
      createNodeMiddleware: jest.fn(),
      createProbot: jest.fn(),
    }));

    require('./index');

    expect(onRequest).toHaveBeenCalledWith({ region: 'europe-west2' }, expect.anything());
  });
});
