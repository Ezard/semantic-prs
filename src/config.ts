import { types } from 'conventional-commit-types';

export type Config = {
  enabled: boolean;
  titleOnly: boolean;
  commitsOnly: boolean;
  titleAndCommits: boolean;
  anyCommit: boolean;
  scopes: string[] | null;
  types: string[];
  allowMergeCommits: boolean;
  allowRevertCommits: boolean;
};

export const defaultConfig: Config = {
  enabled: true,
  titleOnly: false,
  commitsOnly: false,
  titleAndCommits: false,
  anyCommit: false,
  scopes: null,
  types: Object.keys(types),
  allowMergeCommits: false,
  allowRevertCommits: false,
};
