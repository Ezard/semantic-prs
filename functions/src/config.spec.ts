import { types } from 'conventional-commit-types';
import { defaultConfig } from './config';

describe('defaultConfig', () => {
  it('should use the correct default config', () => {
    const config = defaultConfig;

    expect(config.enabled).toEqual(true);
    expect(config.titleOnly).toEqual(false);
    expect(config.commitsOnly).toEqual(false);
    expect(config.titleAndCommits).toEqual(false);
    expect(config.anyCommit).toEqual(false);
    expect(config.scopes).toBeNull();
    expect(config.types).toEqual(Object.keys(types));
    expect(config.allowMergeCommits).toEqual(false);
    expect(config.allowRevertCommits).toEqual(false);
    expect(config.targetUrl).toEqual('https://github.com/Ezard/semantic-prs');
  });
});
