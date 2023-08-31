import type {
  PullRequestEditedEvent,
  PullRequestOpenedEvent,
  PullRequestSynchronizeEvent,
} from '@octokit/webhooks-types';
import type { Context } from 'probot';
import { Config, defaultConfig } from './config';
import { isMessageSemantic } from './is-message-semantic';

type PullRequestPayload = PullRequestOpenedEvent | PullRequestEditedEvent | PullRequestSynchronizeEvent;
export type ContextEvent =
  | 'pull_request.opened'
  | 'pull_request.reopened'
  | 'pull_request.edited'
  | 'pull_request.synchronize';
export type Status = {
  sha: string;
  state: 'error' | 'failure' | 'pending' | 'success';
  target_url: string;
  description: string;
  context: string;
};

async function getCommitMessages(context: Context<ContextEvent>): Promise<string[]> {
  const commits = await context.octokit.rest.pulls.listCommits(
    context.repo({
      pull_number: (context.payload as PullRequestPayload).pull_request.number,
    }),
  );
  return commits.data.map(commit => commit.commit.message);
}

async function checkIfCommitsAreSemantic(
  commitMessages: string[],
  config: Config,
): Promise<{ someCommitsSemantic: boolean; allCommitsSemantic: boolean }> {
  const numSemanticCommits = commitMessages.filter(isMessageSemantic(config)).length;
  return {
    someCommitsSemantic: numSemanticCommits > 0,
    allCommitsSemantic: numSemanticCommits === commitMessages.length,
  };
}

export async function handlePullRequestChange(context: Context<ContextEvent>): Promise<void> {
  const { title, head } = (context.payload as PullRequestPayload).pull_request;
  const config = (await context.config<Config>('semantic.yml', defaultConfig)) as Config;

  const hasSemanticTitle = isMessageSemantic(config)(title);
  const commitMessages = await getCommitMessages(context);
  const { someCommitsSemantic, allCommitsSemantic } = await checkIfCommitsAreSemantic(commitMessages, config);
  const numNonMergeCommits = commitMessages.filter(message => !message.startsWith('Merge')).length;

  abstract class SemanticState {
    protected constructor(public isSemantic: boolean) {}

    getState(): 'success' | 'failure' {
      return this.isSemantic ? 'success' : 'failure';
    }

    abstract getDescription(): string;
  }

  class InfoSemanticState extends SemanticState {
    constructor(
      isSemantic: boolean,
      private message: string,
    ) {
      super(isSemantic);
    }

    getDescription(): string {
      return this.message;
    }
  }

  class SuccessFailureSemanticState extends SemanticState {
    constructor(
      isSemantic: boolean,
      private successMessage: string,
      private failureMessage: string,
    ) {
      super(isSemantic);
    }

    getDescription(): string {
      return this.isSemantic ? this.successMessage : this.failureMessage;
    }
  }

  function getSemanticState(): SemanticState {
    if (!config.enabled) {
      return new InfoSemanticState(true, 'skipped; check enabled in semantic.yml config');
    } else if (config.titleOnly) {
      return new SuccessFailureSemanticState(hasSemanticTitle, 'ready to be squashed', 'add a semantic PR title');
    } else if (config.commitsOnly) {
      if (config.anyCommit) {
        return new SuccessFailureSemanticState(
          someCommitsSemantic,
          'ready to be merged or rebased',
          'add a semantic commit',
        );
      } else {
        return new SuccessFailureSemanticState(
          allCommitsSemantic,
          'ready to be merged or rebased',
          'make sure every commit is semantic',
        );
      }
    } else if (config.titleAndCommits) {
      if (config.anyCommit) {
        return new SuccessFailureSemanticState(
          hasSemanticTitle && someCommitsSemantic,
          'ready to be merged, squashed or rebased',
          'add a semantic commit AND PR title',
        );
      } else {
        return new SuccessFailureSemanticState(
          hasSemanticTitle && allCommitsSemantic,
          'ready to be merged, squashed or rebased',
          'make sure every commit AND the PR title is semantic',
        );
      }
    } else if (numNonMergeCommits === 1) {
      return new SuccessFailureSemanticState(
        someCommitsSemantic,
        'ready to be squashed',
        "PR has only one non-merge commit and it's not semantic; add another commit before squashing",
      );
    } else if (hasSemanticTitle) {
      return new InfoSemanticState(hasSemanticTitle, 'ready to be squashed');
    } else {
      return new SuccessFailureSemanticState(
        allCommitsSemantic,
        'ready to be merged or rebased',
        'add a semantic commit or PR title',
      );
    }
  }

  const semanticState = getSemanticState();
  const status: Status = {
    sha: head.sha,
    state: semanticState.getState(),
    target_url: config.targetUrl,
    description: semanticState.getDescription(),
    context: 'Semantic PR',
  };
  await context.octokit.rest.repos.createCommitStatus(context.repo(status));
}
