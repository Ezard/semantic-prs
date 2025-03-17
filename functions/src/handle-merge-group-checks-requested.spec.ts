import { Context, ProbotOctokit } from 'probot';
import { Status } from './status';
import nock, { Scope } from 'nock';
import { handleMergeGroupChecksRequested } from './handle-merge-group-checks-requested';

function createContext(): Context<'merge_group.checks_requested'> {
  return new Context<'merge_group.checks_requested'>(
    {
      id: 'abc123',
      name: 'merge_group',
      payload: {
        action: 'checks_requested',
        repository: {
          name: 'bar',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          owner: {
            login: 'foo',
          },
          url: 'https://github.com/foo/bar',
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        merge_group: {
          head_sha: 'def456',
        },
      },
    },
    new ProbotOctokit(),
    console,
  );
}

async function setupTest(
  configYaml: string,
  expectedStatusBody: {
    state: Status['state'];
    description: Status['description'];
    target_url?: Status['target_url'];
  },
): Promise<{ context: Context<'merge_group.checks_requested'>; scope: Scope }> {
  const context: Context<'merge_group.checks_requested'> = createContext();
  const scope = nock('https://api.github.com', { allowUnmocked: false })
    .get('/repos/foo/bar/contents/.github%2Fsemantic.yml')
    .reply(200, configYaml)
    .post('/repos/foo/bar/statuses/def456', {
      context: 'Semantic PR',
      state: expectedStatusBody.state,
      description: expectedStatusBody.description,
      target_url: expectedStatusBody.target_url ?? 'https://github.com/Ezard/semantic-prs',
    })
    .reply(200);

  return { context, scope };
}

describe('handleMergeGroupChecksRequested', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    process.env.APP_NAME = 'Semantic PR';
  });

  afterAll(() => {
    nock.enableNetConnect();
    delete process.env.APP_NAME;
  });

  describe('when merge group checks are requested', () => {
    it('should set a success status', async () => {
      const { context, scope } = await setupTest('targetUrl: https://google.co.uk', {
        state: 'success',
        description: 'nothing to report for merge queues',
        target_url: 'https://google.co.uk',
      });

      await handleMergeGroupChecksRequested(context);

      expect(scope.isDone()).toEqual(true);
    });
  });
});
