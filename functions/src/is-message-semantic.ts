import { ConventionalChangelogCommit, parser, toConventionalChangelogFormat } from '@conventional-commits/parser';
import { types } from 'conventional-commit-types';
import { Config } from './config';

const commitTypes = Object.keys(types);
const validTypeSyntaxRegex = /^.*: [^ ].*$/;

export function isMessageSemantic({
  scopes,
  types,
  allowMergeCommits,
  allowRevertCommits,
}: Config): (message: string) => boolean {
  return function (message: string) {
    const isMergeCommit = message.startsWith('Merge');
    if (allowMergeCommits && isMergeCommit) {
      return true;
    }

    const isRevertCommit = message.startsWith('Revert');
    if (allowRevertCommits && isRevertCommit) {
      return true;
    }

    if (message.startsWith(' ')) {
      return false;
    }

    let commit: ConventionalChangelogCommit;
    try {
      commit = toConventionalChangelogFormat(parser(message));
    } catch {
      return false;
    }

    const { scope, type } = commit;
    const isScopeValid = !scopes || !scope || scope.split(/, ?/).every((commitScope: string) => {
      return scopes.some(configuredScope => {
        // First try exact match
        if (configuredScope === commitScope) {
          return true;
        }
        
        // Then try regex match - treating the configured scope as a pattern
        try {
          const regex = new RegExp(`^${configuredScope}`);
          return regex.test(commitScope);
        } catch {
          // If it's not a valid regex pattern, just do exact match
          return false;
        }
      });
    });
    const isTypeValid = (types.length > 0 ? types : commitTypes).includes(type) && validTypeSyntaxRegex.test(message);

    return isTypeValid && isScopeValid;
  };
}
