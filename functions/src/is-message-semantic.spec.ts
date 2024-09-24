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
});
