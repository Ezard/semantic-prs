import { ConventionalChangelogCommit, parser, toConventionalChangelogFormat } from '@conventional-commits/parser';
import { types } from 'conventional-commit-types';
import { Config } from './config';

const commitTypes = Object.keys(types);
const validTypeSyntaxRegex = /^.*: [^ ].*$/;

type AllowedScope = {
  exact: string;
  regex: RegExp | null;
};

const toScopeRegex = (scope: string): RegExp | null => {
  try {
    return new RegExp(`^(?:${scope})$`);
  } catch {
    return null;
  }
};

const isAllowedScope = ({ exact, regex }: AllowedScope, scope: string): boolean =>
  exact === scope || regex?.test(scope) === true;

export function isMessageSemantic({
  scopes,
  types,
  allowMergeCommits,
  allowRevertCommits,
}: Config): (message: string) => boolean {
  const allowedScopes = scopes?.map(scope => ({
    exact: scope,
    regex: toScopeRegex(scope),
  }));

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
    const isScopeValid =
      !allowedScopes ||
      !scope ||
      scope.split(/, ?/).every(scope => allowedScopes.some(allowedScope => isAllowedScope(allowedScope, scope)));
    const isTypeValid = (types.length > 0 ? types : commitTypes).includes(type) && validTypeSyntaxRegex.test(message);

    return isTypeValid && isScopeValid;
  };
}
