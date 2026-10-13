import * as tracer from '@google-cloud/trace-agent';

if (process.env.NODE_ENV !== 'test') {
  tracer.start();
}

import { onRequest } from 'firebase-functions/https';
import { createNodeMiddleware, createProbot } from 'probot';
import { app } from './app';

let middleware: ReturnType<typeof createNodeMiddleware> | undefined;

function getMiddleware() {
  if (!middleware) {
    middleware = createNodeMiddleware(app, {
      probot: createProbot(),
      webhooksPath: '/',
    });
  }
  return middleware;
}

export const semanticPrs = onRequest(
  {
    region: 'us-central1',
    invoker: 'public',
  },
  (req, res) => {
    const api = tracer.get();
    const traceContext = api.propagation.extract(key => req.headers?.[key] as string | undefined);

    api.runInRootSpan({ name: 'semanticPrs', traceContext }, root => {
      res.on('finish', () => {
        root.endSpan();
      });
      getMiddleware()(req, res);
    });
  },
);
