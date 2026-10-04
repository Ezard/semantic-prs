import { createNodeMiddleware } from 'probot';
import { onRequest } from 'firebase-functions/https';
import { ServerResponse } from 'node:http';

jest.mock('firebase-functions/https', () => ({
  onRequest: jest.fn((_, handler) => handler),
}));

jest.mock('probot', () => ({
  createNodeMiddleware: jest.fn(() => jest.fn((_, res: ServerResponse) => res.end())),
  createProbot: jest.fn(() => ({})),
}));

jest.mock('./app', () => ({
  app: jest.fn(),
}));

describe('semanticPrs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use the europe-west2 region', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./index');

    expect(onRequest).toHaveBeenCalledWith({ region: 'europe-west2' }, expect.any(Function));
  });

  it('should reuse the middleware instance across multiple invocations', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { semanticPrs } = require('./index');

      const mockReq = {};
      const mockRes = { end: jest.fn() } as unknown as ServerResponse;

      // 1st invocation creates middleware
      semanticPrs(mockReq, mockRes);
      expect(createNodeMiddleware).toHaveBeenCalledTimes(1);

      // 2nd invocation reuses cached middleware
      semanticPrs(mockReq, mockRes);
      expect(createNodeMiddleware).toHaveBeenCalledTimes(1);
    });
  });
});
