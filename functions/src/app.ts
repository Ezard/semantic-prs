import { Probot } from 'probot';
import { handlePullRequestChange } from './handle-pull-request-change';
import { handleMergeGroupChecksRequested } from './handle-merge-group-checks-requested';

export const app = (app: Probot) => {
  app.on('pull_request.opened', handlePullRequestChange);
  app.on('pull_request.edited', handlePullRequestChange);
  app.on('pull_request.reopened', handlePullRequestChange);
  app.on('pull_request.synchronize', handlePullRequestChange);
  app.on('pull_request.enqueued', handlePullRequestChange);
  app.on('merge_group.checks_requested', handleMergeGroupChecksRequested);
};
