import { ConventionalChangelogCommit, parser, toConventionalChangelogFormat } from '@conventional-commits/parser';
import { types } from 'conventional-commit-types';
import { Config } from './config';

const commitTypes = Object.keys(types);

export function isMessageSemantic({
  scopes,
  types,
  allowMergeCommits,
  allowRevertCommits,
}: Config): (message: string) => boolean {
  return function (message: string) {
    const isMergeCommit = !!message && message.startsWith('Merge');
    if (allowMergeCommits && isMergeCommit) return true;

    const isRevertCommit = !!message && message.startsWith('Revert');
    if (allowRevertCommits && isRevertCommit) return true;

    let commit: ConventionalChangelogCommit;
    try {
      commit = toConventionalChangelogFormat(parser(message));
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(err);
      }
      return false;
    }

    const { scope, type } = commit;
    const isScopeValid =
      !scopes ||
      !scope ||
      scope
        .split(',')
        .map(scope => scope.trim())
        .every(scope => scopes.includes(scope));
    const isTypeValid = (types.length > 0 ? types : commitTypes).includes(type);
    return isTypeValid && isScopeValid;
  };
}
