import { onRequest } from 'firebase-functions/https';
import { createNodeMiddleware, createProbot } from 'probot';
import { app } from './app';

export const semanticPrs = onRequest(
  {
    region: 'europe-west2',
  },
  (req, res) => {
    createNodeMiddleware(app, {
      probot: createProbot(),
      webhooksPath: '/',
    })(req, res);
  },
);
