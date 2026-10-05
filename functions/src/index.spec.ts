import * as tracer from '@google-cloud/trace-agent';
import { createNodeMiddleware } from 'probot';
import { onRequest } from 'firebase-functions/https';
import { ServerResponse } from 'node:http';

jest.mock('@google-cloud/trace-agent', () => ({
  start: jest.fn(),
  get: jest.fn(),
}));

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

  it('should use the us-central1 region and allow public invocation', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./index');

    expect(onRequest).toHaveBeenCalledWith(
      {
        region: 'us-central1',
        invoker: 'public',
      },
      expect.any(Function),
    );
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

  describe('trace-agent initialization', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should not start the trace-agent in test environment', () => {
      process.env.NODE_ENV = 'test';
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./index');
        expect(tracer.start).not.toHaveBeenCalled();
      });
    });

    it('should start the trace-agent when not in test environment', () => {
      process.env.NODE_ENV = 'production';
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./index');
        expect(tracer.start).toHaveBeenCalledTimes(1);
      });
    });
  });
});
