# Semantic PRS

> A GitHub app to check that pull requests follow the Conventional Commits spec

## Installation

Install the app from the GitHub Marketplace here: [https://github.com/apps/semantic-prs](https://github.com/apps/semantic-prs)

## Configuration

By default, no configuration is necessary. The default behaviour is that only the PR title or at least one commit message needs to follow the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/)

This can be changed by creating a `semantic.yml` file in your `.github` directory, with any of the following optional settings:

```yaml
# Enable/disable creation of status checks
enabled: <boolean> # default: true
```

```yaml
# Validate the PR title, and ignore all commit messages
titleOnly: <boolean> # default: false
```

```yaml
# Validate all commit messages, and ignore the PR title
commitsOnly: <boolean> # default: false
```

```yaml
# Validate the PR title and all commit messages
titleAndCommits: <boolean> # default: false
```

```yaml
# If commitsOnly or titleAndCommits is set to true, then only a single commit needs to pass validation instead of every commit
# If neither of those options are set to true then this option is ignored
anyCommit: <boolean> # default: false
```

```yaml
types:
  - <string>
  - <string>
  - ...
```

```yaml
scopes:
  - <string>
  - <string>
  - ...
```

```yaml
# Allow merge commits (e.g. 'Merge branch "master" into fix/delete-all-tests')
# If neither of commitsOnly or titleAndCommits is set to true then this option is ignored
allowMergeCommits: <boolean> # default: false
```

```yaml
# Allow revert commits (e.g. 'Revert "fix: delete all tests"')
# If neither of commitsOnly or titleAndCommits is set to true then this option is ignored
allowRevertCommits: <boolean> # default: false
```

## Credits

Heavily based on the [Semantic Pull Requests](https://github.com/zeke/semantic-pull-requests) GitHub App created by [@zeke](https://github.com/zeke)
