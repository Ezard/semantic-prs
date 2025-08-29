import { defaultConfig } from './config';
import { isMessageSemantic } from './is-message-semantic';

describe('isMessageSemantic', () => {
  it('should return true if the message is for a merge commit and allowMergeCommits is set to true', () => {
    const message = 'Merge branch foo into master';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      allowMergeCommits: true,
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return false if the message is for a merge commit and allowMergeCommits is set to false', () => {
    const message = 'Merge branch foo into master';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      allowMergeCommits: false,
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return false if the message is non-semantic and not for a merge commit and allowMergeCommits is set to true', () => {
    const message = 'Change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      allowMergeCommits: true,
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return true if the message is for a revert commit and allowRevertCommits is set to true', () => {
    const message = 'Revert commit abc123';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      allowRevertCommits: true,
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return false if the message is for a revert commit and allowRevertCommits is set to false', () => {
    const message = 'Revert commit abc123';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      allowRevertCommits: false,
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return false if the message is non-semantic and not for a revert commit and allowRevertCommits is set to true', () => {
    const message = 'Change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      allowRevertCommits: true,
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return true if the message is semantic and no scopes have been defined and the type is valid', () => {
    const message = 'feat(auth): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: null,
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return true if the message is semantic and does not contain a scope and the type is valid', () => {
    const message = 'feat: change foo to bar';

    const isSemantic = isMessageSemantic(defaultConfig)(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return true if the message is semantic and has a single allowed scope and the type is valid', () => {
    const message = 'feat(auth): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['auth', 'docs', 'profile'],
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return true if the message is semantic and has multiple allowed scopes and the type is valid', () => {
    const message = 'feat(auth,docs): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['auth', 'docs', 'profile'],
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return false if the message is semantic and has a single disallowed scope and the type is valid', () => {
    const message = 'feat(auth): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['docs', 'profile'],
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return false if the message is semantic and has multiple disallowed scopes and the type is valid', () => {
    const message = 'feat(auth,docs): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['profile'],
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return false if the message is semantic and has mix of allowed and disallowed scopes and the type is valid', () => {
    const message = 'feat(auth,docs): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['auth', 'profile'],
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should true if the message has a valid type and multiple valid scopes separated by just commas', () => {
    const message = 'feat(auth,docs,profile): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['auth', 'docs', 'profile'],
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should true if the message has a valid type and multiple valid scopes separated by commas with spaces', () => {
    const message = 'feat(auth, docs, profile): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['auth', 'docs', 'profile'],
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should true if the message has a valid type and multiple valid scopes, separated by a combination of just commas and commas with spaces', () => {
    const message = 'feat(auth,docs, profile): change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      scopes: ['auth', 'docs', 'profile'],
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return true if no types are provided and the type is one of the default types', () => {
    const message = 'feat: change foo to bar';

    const isSemantic = isMessageSemantic(defaultConfig)(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return false if no types are provided and the type is not one of the default types', () => {
    const message = 'baz: change foo to bar';

    const isSemantic = isMessageSemantic(defaultConfig)(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return true if an empty list of types are provided and the type is one of the default types', () => {
    const message = 'feat: change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      types: [],
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return false if an empty list of types are provided and the type is not one of the default types', () => {
    const message = 'baz: change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      types: [],
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return true if types are provided and the type is one of the provided types', () => {
    const message = 'baz: change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      types: ['baz'],
    })(message);

    expect(isSemantic).toEqual(true);
  });

  it('should return false if types are provided and the type is not one of the provided types', () => {
    const message = 'thing: change foo to bar';

    const isSemantic = isMessageSemantic({
      ...defaultConfig,
      types: ['baz'],
    })(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return false if there is leading whitespace', () => {
    const message = ' feat: change foo to bar';

    const isSemantic = isMessageSemantic(defaultConfig)(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return false if there is no whitespace after the type', () => {
    const message = 'feat:change foo to bar';

    const isSemantic = isMessageSemantic(defaultConfig)(message);

    expect(isSemantic).toEqual(false);
  });

  it('should return false if there is scope but no whitespace after the type', () => {
    const message = 'feat(foo):change foo to bar';

    const isSemantic = isMessageSemantic(defaultConfig)(message);

    expect(isSemantic).toEqual(false);
  });

  describe('regex scope matching', () => {
    it('should return true if scope matches a regex pattern', () => {
      const message = 'feat(TWD-1234): implement new feature';

      const isSemantic = isMessageSemantic({
        ...defaultConfig,
        scopes: ['TWD-'],
      })(message);

      expect(isSemantic).toEqual(true);
    });

    it('should return true for multiple ticket numbers matching the pattern', () => {
      const message1 = 'feat(TWD-1234): implement feature A';
      const message2 = 'fix(TWD-5678): fix bug B';

      const config = {
        ...defaultConfig,
        scopes: ['TWD-'],
      };

      expect(isMessageSemantic(config)(message1)).toEqual(true);
      expect(isMessageSemantic(config)(message2)).toEqual(true);
    });

    it('should support multiple regex patterns', () => {
      const message1 = 'feat(TWD-1234): implement feature';
      const message2 = 'fix(JIRA-5678): fix bug';

      const isSemantic1 = isMessageSemantic({
        ...defaultConfig,
        scopes: ['TWD-', 'JIRA-'],
      })(message1);

      const isSemantic2 = isMessageSemantic({
        ...defaultConfig,
        scopes: ['TWD-', 'JIRA-'],
      })(message2);

      expect(isSemantic1).toEqual(true);
      expect(isSemantic2).toEqual(true);
    });

    it('should support mix of exact matches and regex patterns', () => {
      const message1 = 'feat(auth): add authentication';
      const message2 = 'fix(TWD-1234): fix bug';
      const message3 = 'docs(readme): update docs';

      const config = {
        ...defaultConfig,
        scopes: ['auth', 'TWD-', 'readme'],
      };

      expect(isMessageSemantic(config)(message1)).toEqual(true);
      expect(isMessageSemantic(config)(message2)).toEqual(true);
      expect(isMessageSemantic(config)(message3)).toEqual(true);
    });

    it('should return false if scope does not match any pattern', () => {
      const message = 'feat(ABC-1234): implement feature';

      const isSemantic = isMessageSemantic({
        ...defaultConfig,
        scopes: ['TWD-', 'JIRA-'],
      })(message);

      expect(isSemantic).toEqual(false);
    });

    it('should handle invalid regex patterns gracefully', () => {
      const message = 'feat(auth): add feature';

      // Using '[' which is an invalid regex
      const isSemantic = isMessageSemantic({
        ...defaultConfig,
        scopes: ['[', 'auth'],
      })(message);

      expect(isSemantic).toEqual(true); // Should still match 'auth' exactly
    });

    it('should work with multiple scopes where some match patterns', () => {
      const message = 'feat(TWD-1234,auth): implement auth for ticket';

      const isSemantic = isMessageSemantic({
        ...defaultConfig,
        scopes: ['TWD-', 'auth', 'profile'],
      })(message);

      expect(isSemantic).toEqual(true);
    });

    it('should return false if one scope does not match any pattern in multi-scope commit', () => {
      const message = 'feat(TWD-1234,unknown): implement feature';

      const isSemantic = isMessageSemantic({
        ...defaultConfig,
        scopes: ['TWD-', 'auth'],
      })(message);

      expect(isSemantic).toEqual(false);
    });
  });
});
