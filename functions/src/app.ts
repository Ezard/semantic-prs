import { Probot } from 'probot';
import { handlePullRequestChange } from './handle-pull-request-change';

export const app = (app: Probot) => {
  app.on('pull_request.opened', handlePullRequestChange);
  app.on('pull_request.edited', handlePullRequestChange);
  app.on('pull_request.reopened', handlePullRequestChange);
  app.on('pull_request.synchronize', handlePullRequestChange);
  app.on('pull_request.enqueued', handlePullRequestChange);
};
