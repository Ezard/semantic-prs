import type { PullRequestEvent } from '@octokit/webhooks-types';
import nock from 'nock';
import { Probot, ProbotOctokit } from 'probot';
import { app } from './app';

describe('app', () => {
  let probot: Probot;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      githubToken: 'test',
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    app(probot);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it.each`
    action
    ${'opened'}
    ${'edited'}
    ${'reopened'}
    ${'synchronize'}
  `(
    'should be triggered on pull_request.$action events',
    async ({ action }: { action: 'opened' | 'edited' | 'reopened' | 'synchronize' }) => {
      const mock = nock('https://api.github.com')
        .get('/repos/foo/.github/contents/.github%2Fsemantic.yml')
        .reply(404)
        .get('/repos/foo/bar/contents/.github%2Fsemantic.yml')
        .reply(404)
        .get('/repos/foo/bar/pulls/123/commits')
        .reply(200, [])
        .post('/repos/foo/bar/statuses/def456')
        .reply(200, {});

      await probot.receive({
        id: 'abc123',
        name: 'pull_request',
        payload: {
          action,
          repository: {
            name: 'bar',
            owner: {
              login: 'foo',
            },
            url: 'https://github.com/foo/bar',
          },
          pull_request: {
            number: 123,
            title: 'feat: add foo to bar',
            head: {
              sha: 'def456',
            },
          },
        } as PullRequestEvent,
      });

      expect(mock.isDone()).toEqual(true);
    },
  );
});
