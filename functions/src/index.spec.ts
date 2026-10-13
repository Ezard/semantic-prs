import * as tracer from '@google-cloud/trace-agent';
import { createNodeMiddleware } from 'probot';
import { onRequest } from 'firebase-functions/https';
import { ServerResponse } from 'node:http';

const mockEndSpan = jest.fn();
const mockRunInRootSpan = jest.fn((_, fn) => fn({ endSpan: mockEndSpan }));
const mockExtract = jest.fn<unknown, [((key: string) => string | undefined)?]>((callback) => {
  callback?.('x-cloud-trace-context');
  return null;
});

jest.mock('@google-cloud/trace-agent', () => ({
  start: jest.fn(),
  get: jest.fn(() => ({
    propagation: {
      extract: mockExtract,
      inject: jest.fn(),
    },
    runInRootSpan: mockRunInRootSpan,
  })),
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
      const mockRes = { on: jest.fn(), end: jest.fn() } as unknown as ServerResponse;

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

  describe('root span execution', () => {
    it('should extract trace context and execute within a root span', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { semanticPrs } = require('./index');

      const mockContext = { traceId: '123', spanId: '456' };
      mockExtract.mockImplementationOnce((callback?: (key: string) => string | undefined) => {
        callback?.('x-cloud-trace-context');
        return mockContext;
      });

      const mockReq = { headers: { 'x-cloud-trace-context': '123/456;o=1' } };
      const mockRes = { on: jest.fn(), end: jest.fn() } as unknown as ServerResponse;

      semanticPrs(mockReq, mockRes);

      expect(mockExtract).toHaveBeenCalled();
      expect(mockRunInRootSpan).toHaveBeenCalledWith(
        { name: 'semanticPrs', traceContext: mockContext },
        expect.any(Function),
      );
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should end root span when res.on finish event is emitted', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { semanticPrs } = require('./index');

      let finishCallback: () => void = () => {};
      const mockReq = { headers: {} };
      const mockRes = {
        on: jest.fn((event, cb) => {
          if (event === 'finish') {
            finishCallback = cb;
          }
        }),
        end: jest.fn(),
      } as unknown as ServerResponse;

      semanticPrs(mockReq, mockRes);

      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
      finishCallback();
      expect(mockEndSpan).toHaveBeenCalled();
    });
  });
});
