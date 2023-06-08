import { onRequest } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import { createNodeMiddleware, createProbot, type Options } from 'probot';
import { app } from './app';

const appId = defineString('APP_ID');
const githubToken = defineString('GITHUB_TOKEN');
const logLevel = defineString('LOG_LEVEL');
const privateKey = defineString('PRIVATE_KEY');
const secret = defineString('WEBHOOK_SECRET');

export const semanticPrs = onRequest(
  {
    region: 'europe-west2',
  },
  (req, res) =>
    createNodeMiddleware(app, {
      probot: createProbot({
        defaults: {
          appId: appId.value(),
          githubToken: githubToken.value(),
          logLevel: logLevel.value() as Options['logLevel'],
          privateKey: privateKey.value(),
          secret: secret.value(),
        },
      }),
    })(req, res),
);
