describe('semanticPrs', () => {
  it('should work', () => {
    const requestListener = jest.fn();
    const createNodeMiddleware = jest.fn().mockReturnValue(requestListener);
    const probot = { version: '1.2.3' };
    jest.mock('probot', () => ({
      createNodeMiddleware,
      createProbot: jest.fn().mockReturnValue(probot),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { semanticPrs } = require('./index');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { app } = require('./app');

    const req = {};
    const res = { writeHead: jest.fn(), end: jest.fn() };

    semanticPrs(req, res);

    expect(createNodeMiddleware).toHaveBeenCalledTimes(1);
    expect(createNodeMiddleware).toHaveBeenCalledWith(app, { probot });
    expect(requestListener).toHaveBeenCalledTimes(1);
    expect(requestListener).toHaveBeenCalledWith(req, res);
  });
});
