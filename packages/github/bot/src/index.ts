// import { onRequest } from 'firebase-functions/https';
// import { createNodeMiddleware, createProbot } from 'probot';
import { createProbot } from 'probot';
import { app } from './app.js';
import { EventPayloadMap } from '@octokit/webhooks-types';

const probot = createProbot();
await probot.load(app);

// export const semanticPrs = onRequest(
//   {
//     region: 'europe-west2',
//   },
//   (req, res) => {
//     createNodeMiddleware(app, {
//       probot: createProbot(),
//       webhooksPath: '/',
//     })(req, res);
//   },
// );

interface DOEvent {
  http?: {
    headers?: Record<string, string>;
    method?: string;
    path?: string;
  };
  [key: string]: any;
}

export async function main(event: DOEvent) {
  const headers = event.http?.headers || {};
  const payload = event;

  const id = headers['x-github-delivery'];
  const name = headers['x-github-event'] as keyof EventPayloadMap;
  const signature = headers['x-hub-signature-256'] || headers['x-hub-signature'];

  if (!id || !name || !signature) {
    return {
      statusCode: 400,
      body: { error: 'Missing required GitHub webhook headers.' },
    };
  }

  try {
    await probot.webhooks.verifyAndReceive({
      id,
      name,
      signature,
      payload: JSON.stringify(payload),
    });

    return {
      statusCode: 200,
      body: { message: 'Webhook successfully processed.' },
    };
  } catch (error: any) {
    console.error('Error handling webhook:', error);

    return {
      statusCode: error.status || 500,
      body: { error: error.message || 'Internal Server Error' },
    };
  }
}
