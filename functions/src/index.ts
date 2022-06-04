import { region } from 'firebase-functions';
import { createNodeMiddleware, createProbot } from 'probot';
import { app } from './app';

export const semanticPrs = region('europe-west2').https.onRequest(
  createNodeMiddleware(app, { probot: createProbot() }),
);
