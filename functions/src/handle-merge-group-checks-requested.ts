import { Context } from 'probot';
import { Status } from './status';
import { Config, defaultConfig } from './config';
import { appName } from './app-name';

export async function handleMergeGroupChecksRequested(context: Context<'merge_group.checks_requested'>) {
  const config = (await context.config<Config>('semantic.yml', defaultConfig)) as Config;
  const status: Status = {
    sha: context.payload.merge_group.head_sha,
    state: 'success',
    target_url: config.targetUrl,
    description: 'nothing to report for merge queues',
    context: appName.value(),
  };
  await context.octokit.rest.repos.createCommitStatus(context.repo(status));
}
