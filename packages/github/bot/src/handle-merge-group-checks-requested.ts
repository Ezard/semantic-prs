import { Context } from 'probot';
import { Status } from './status.js';
import { Config, defaultConfig } from './config.js';
import { appName } from './app-name.js';

export async function handleMergeGroupChecksRequested(context: Context<'merge_group.checks_requested'>) {
  const config = (await context.config<Config>('semantic.yml', defaultConfig)) as Config;
  const status: Status = {
    sha: context.payload.merge_group.head_sha,
    state: 'success',
    target_url: config.targetUrl,
    description: 'nothing to report for merge queues',
    context: appName,
  };
  await context.octokit.rest.repos.createCommitStatus(context.repo(status));
}
