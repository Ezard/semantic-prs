import nock, { type Scope } from 'nock';
import { Context, ProbotOctokit } from 'probot';
import type { ContextEvent, Status } from './handle-pull-request-change';
import { handlePullRequestChange } from './handle-pull-request-change';

function createContext(title: string): Context<ContextEvent> {
  return new Context<ContextEvent>(
    {
      id: 'abc123',
      name: 'pull_request',
      payload: {
        action: 'opened',
        repository: {
          name: 'bar',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          owner: {
            login: 'foo',
          },
          url: 'https://github.com/foo/bar',
        },
        pull_request: {
          number: 123,
          title,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          head: {
            sha: 'def456',
          },
        },
      },
    },
    new ProbotOctokit(),
    console,
  );
}

async function setupTest(
  title: string,
  commitMessages: string[],
  configYaml: string,
  expectedStatusBody: {
    state: Status['state'];
    description: Status['description'];
    target_url?: Status['target_url'];
  },
): Promise<{ context: Context<ContextEvent>; scope: Scope }> {
  const context: Context<ContextEvent> = createContext(title);
  const scope = nock('https://api.github.com', { allowUnmocked: false })
    .get('/repos/foo/bar/contents/.github%2Fsemantic.yml')
    .reply(200, configYaml)
    .get('/repos/foo/bar/pulls/123/commits')
    .reply(
      200,
      commitMessages.map(commitMessage => ({ commit: { message: commitMessage } })),
    )
    .post('/repos/foo/bar/statuses/def456', {
      context: 'Semantic PR',
      state: expectedStatusBody.state,
      description: expectedStatusBody.description,
      target_url: expectedStatusBody.target_url ?? 'https://github.com/Ezard/semantic-prs',
    })
    .reply(200);

  return { context, scope };
}

const SEMANTIC_TITLE = 'feat: change foo to bar';
const UNSEMANTIC_TITLE = 'Change foo to bar';
const SEMANTIC_COMMIT_MESSAGES = ['feat: update foobar', 'fix: replace dependency baz'];
const UNSEMANTIC_COMMIT_MESSAGES = ['Update foobar', 'Replace dependency baz'];
const MIXED_COMMIT_MESSAGES = [SEMANTIC_COMMIT_MESSAGES[0], UNSEMANTIC_COMMIT_MESSAGES[0]];

describe('handlePullRequestChange', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    process.env.APP_NAME = 'Semantic PR';
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
    delete process.env.APP_NAME;
  });

  describe('when "enabled" is set to false in config', () => {
    it('should set a success status with a skipped message', async () => {
      const { context, scope } = await setupTest('', [], 'enabled: false', {
        state: 'success',
        description: 'skipped; check enabled in semantic.yml config',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });
  });

  describe('when "titleOnly" is set to true in config', () => {
    it('should set a success status if the title is semantic and all commit messages are semantic', async () => {
      const { context, scope } = await setupTest(SEMANTIC_TITLE, SEMANTIC_COMMIT_MESSAGES, 'titleOnly: true', {
        state: 'success',
        description: 'ready to be squashed',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a success status if the title is semantic and no commit messages are semantic', async () => {
      const { context, scope } = await setupTest(SEMANTIC_TITLE, UNSEMANTIC_COMMIT_MESSAGES, 'titleOnly: true', {
        state: 'success',
        description: 'ready to be squashed',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a success status if the title is semantic and some commit messages are semantic', async () => {
      const { context, scope } = await setupTest(SEMANTIC_TITLE, MIXED_COMMIT_MESSAGES, 'titleOnly: true', {
        state: 'success',
        description: 'ready to be squashed',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a failure status if the title is not semantic and all commit messages are semantic', async () => {
      const { context, scope } = await setupTest(UNSEMANTIC_TITLE, SEMANTIC_COMMIT_MESSAGES, 'titleOnly: true', {
        state: 'failure',
        description: 'add a semantic PR title',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a failure status if the title is not semantic and no commit messages are semantic', async () => {
      const { context, scope } = await setupTest(UNSEMANTIC_TITLE, UNSEMANTIC_COMMIT_MESSAGES, 'titleOnly: true', {
        state: 'failure',
        description: 'add a semantic PR title',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a failure status if the title is not semantic and some commit messages are semantic', async () => {
      const { context, scope } = await setupTest(UNSEMANTIC_TITLE, MIXED_COMMIT_MESSAGES, 'titleOnly: true', {
        state: 'failure',
        description: 'add a semantic PR title',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });
  });

  describe('when "commitsOnly" is set to true in config', () => {
    describe('when "anyCommit" is set to true in config', () => {
      it('should set a success status if all commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: true',
          {
            state: 'success',
            description: 'ready to be merged or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a success status if all commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: true',
          {
            state: 'success',
            description: 'ready to be merged or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a success status if some commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: true',
          {
            state: 'success',
            description: 'ready to be merged or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a success status if some commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: true',
          {
            state: 'success',
            description: 'ready to be merged or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: true',
          {
            state: 'failure',
            description: 'add a semantic commit',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: true',
          {
            state: 'failure',
            description: 'add a semantic commit',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });
    });
    describe('when "anyCommit" is set to false in config', () => {
      it('should set a success status if all commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: false',
          {
            state: 'success',
            description: 'ready to be merged or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a success status if all commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: false',
          {
            state: 'success',
            description: 'ready to be merged or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if some commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if some commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'commitsOnly: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });
    });
  });

  describe('when "titleAndCommits" is set to true in config', () => {
    describe('when "anyCommit" is set to true in config', () => {
      it('should set a success status if all commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: true',
          {
            state: 'success',
            description: 'ready to be merged, squashed or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if all commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: true',
          {
            state: 'failure',
            description: 'add a semantic commit AND PR title',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a success status if some commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: true',
          {
            state: 'success',
            description: 'ready to be merged, squashed or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if some commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: true',
          {
            state: 'failure',
            description: 'add a semantic commit AND PR title',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: true',
          {
            state: 'failure',
            description: 'add a semantic commit AND PR title',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: true',
          {
            state: 'failure',
            description: 'add a semantic commit AND PR title',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });
    });
    describe('when "anyCommit" is set to false in config', () => {
      it('should set a success status if all commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: false',
          {
            state: 'success',
            description: 'ready to be merged, squashed or rebased',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if all commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          SEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit AND the PR title is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if some commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit AND the PR title is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if some commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          UNSEMANTIC_TITLE,
          MIXED_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit AND the PR title is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit AND the PR title is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });

      it('should set a failure status if no commit messages are semantic and the title is not semantic', async () => {
        const { context, scope } = await setupTest(
          SEMANTIC_TITLE,
          UNSEMANTIC_COMMIT_MESSAGES,
          'titleAndCommits: true\nanyCommit: false',
          {
            state: 'failure',
            description: 'make sure every commit AND the PR title is semantic',
          },
        );

        await handlePullRequestChange(context);

        expect(scope.isDone()).toEqual(true);
      });
    });
  });

  describe('when the number of non-merge commits is equal to 1', () => {
    it('should set a success status if there is 1 merge commit and 1 semantic commit', async () => {
      const { context, scope } = await setupTest(
        SEMANTIC_TITLE,
        ['Merge foo into bar', SEMANTIC_COMMIT_MESSAGES[0]],
        '',
        {
          state: 'success',
          description: 'ready to be squashed',
        },
      );

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a success status if there are 2 merge commits and 1 semantic commit', async () => {
      const { context, scope } = await setupTest(
        SEMANTIC_TITLE,
        ['Merge foo into bar', 'Merge bar into foo', SEMANTIC_COMMIT_MESSAGES[0]],
        '',
        {
          state: 'success',
          description: 'ready to be squashed',
        },
      );

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a failure status if there is 1 merge commit and 1 unsemantic commit', async () => {
      const { context, scope } = await setupTest(
        SEMANTIC_TITLE,
        ['Merge foo into bar', UNSEMANTIC_COMMIT_MESSAGES[0]],
        '',
        {
          state: 'failure',
          description: "PR has only one non-merge commit and it's not semantic; add another commit before squashing",
        },
      );

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a failure status if there are 2 merge commits and 1 unsemantic commit', async () => {
      const { context, scope } = await setupTest(
        SEMANTIC_TITLE,
        ['Merge foo into bar', 'Merge bar into foo', UNSEMANTIC_COMMIT_MESSAGES[0]],
        '',
        {
          state: 'failure',
          description: "PR has only one non-merge commit and it's not semantic; add another commit before squashing",
        },
      );

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });
  });

  describe('when the title is semantic', () => {
    it('should set a success status if all commits are semantic', async () => {
      const { context, scope } = await setupTest(SEMANTIC_TITLE, SEMANTIC_COMMIT_MESSAGES, '', {
        state: 'success',
        description: 'ready to be squashed',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a success status if some commits are semantic', async () => {
      const { context, scope } = await setupTest(SEMANTIC_TITLE, MIXED_COMMIT_MESSAGES, '', {
        state: 'success',
        description: 'ready to be squashed',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a success status if no commits are semantic', async () => {
      const { context, scope } = await setupTest(SEMANTIC_TITLE, UNSEMANTIC_COMMIT_MESSAGES, '', {
        state: 'success',
        description: 'ready to be squashed',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });
  });

  describe('when the title is not semantic', () => {
    it('should set a success status if all commits are semantic', async () => {
      const { context, scope } = await setupTest(UNSEMANTIC_TITLE, SEMANTIC_COMMIT_MESSAGES, '', {
        state: 'success',
        description: 'ready to be merged or rebased',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a failure status if some commits are semantic', async () => {
      const { context, scope } = await setupTest(UNSEMANTIC_TITLE, MIXED_COMMIT_MESSAGES, '', {
        state: 'failure',
        description: 'add a semantic commit or PR title',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });

    it('should set a failure status if no commits are semantic', async () => {
      const { context, scope } = await setupTest(UNSEMANTIC_TITLE, UNSEMANTIC_COMMIT_MESSAGES, '', {
        state: 'failure',
        description: 'add a semantic commit or PR title',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });
  });

  /*describe('when "types" are set in config', () => {});

  describe('when "types" are not set in config', () => {});

  describe('when "scopes" are set in config', () => {});

  describe('when "scopes" are not set in config', () => {});

  describe('when "allowMergeCommits" is set to true config', () => {});

  describe('when "allowMergeCommits" is set to false in config', () => {});

  describe('when "allowRevertCommits" is set to true config', () => {});

  describe('when "allowRevertCommits" is set to false in config', () => {});

  describe('when "targetUrl" is set in config', () => {
    it('should use the provided URL when creating the status check', async () => {
      const { context, scope } = await setupTest('', [], 'enabled: false\ntargetUrl: "https://google.co.uk"', {
        state: 'success',
        description: 'skipped; check enabled in semantic.yml config',
        target_url: 'https://google.co.uk',
      });

      await handlePullRequestChange(context);

      expect(scope.isDone()).toEqual(true);
    });
  });

  describe('when "targetUrl" is not set in config', () => {});*/
});
