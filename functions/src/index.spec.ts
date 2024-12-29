describe('semanticPrs', () => {
  it('should use the europe-west2 region', () => {
    const region = jest.fn().mockReturnValue({
      https: {
        onRequest: jest.fn(),
      },
    });
    jest.mock('firebase-functions', () => ({
      region,
    }));
    jest.mock('probot', () => ({
      createNodeMiddleware: jest.fn(),
      createProbot: jest.fn(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./index');

    expect(region).toHaveBeenCalledWith('europe-west2');
  });
});
