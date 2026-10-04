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
    getMiddleware()(req, res);
  },
);
