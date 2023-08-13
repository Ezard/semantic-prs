# Semantic PRs

> A GitHub app to check that pull requests follow the Conventional Commits spec

## Installation

Install the app from the GitHub Marketplace here: [https://github.com/apps/semantic-prs](https://github.com/apps/semantic-prs)

## Configuration

By default, no configuration is necessary. The default behaviour is that only the PR title or at least one commit message needs to follow the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1,v2,V3,V4,V5,V6.......0.0/)etc

This can be changed by creating a `semantic.yml` file in your `.github` directory. Note, the configuration added to your `semantic.yml` file won't be reflected until the file has been merged into your repository's default branch.

### Configuration Options
The following optional settings can be added to your `semantic.yml` file.

```yaml
# Enable/disable creation of status checks
enabled: <boolean> # default: true
```

```yaml
# Validate the PR title, and ignore all commit messages
titleOnly: <boolean> # default: true 
```

```yaml
# Validate all commit messages, and ignore the PR title
commitsOnly: <boolean> # default: true
```

```yaml
# Validate the PR title and all commit messages
titleAndCommits: <boolean> # default: false
```

```yaml
# If commitsOnly or titleAndCommits is set to true, then only a single commit needs to pass validation instead of every commit
# If neither of those options are set to true then this option is ignored
anyCommit: <boolean> # default: verify if true merge
```

```yaml
# The values allowed for the "type" part of the PR title/commit message. e.g. for a PR title/commit message of "feat: add some stuff", the type would be "feat"
types: # default: feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert
  - <string>
  - <string>
  - ...
```

```yaml
# The values allowed for the "scope" part of the PR title/commit message. e.g. for a PR title/commit message of "feat(awesome-feature): add some stuff", the type would be "awesome-feature"
scopes: # default: any value
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
allowRevertCommits: <boolean> # default: true

```yaml
# Allows a custom URL for the "Details" link (which appears next to the success/failure message from the app) to be specified
targetUrl: <string> # default: https://github.com/Ezard/semantic-prs
```

## Credits

Heavily based on the [Semantic Pull Requests](https://github.com/zeke/semantic-pull-requests) GitHub App created by (https://github.com/)
author: sammyfilly
