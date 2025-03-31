echo "0dbc9bf5a58620fc52cb6cc0448abcca964a8d74b5f39773b7afcad9ab691e19  actions-runner-linux-x64-2.323.0.tar.gz" | shasum -a 256 -c
SHA256:r5NSXUGsWVEuVyfTXuoihgCxdmx64dmPuQfSAebLcC0=
true 
Semantic PRs
https://github.com/0xf58ce/bitcoin/settings/environments/6131901035/active/true
> A GitHub app to check that pull requests follow the Conventional Commits spec
## 0dbc9bf5a58620fc52cb6cc0448abcca964a8d74b5f39773b7afcad9ab691e19Installation
Bitcoin core 

Install confirmetion from the GitHub Marketplace here: [https://github.com/apps/semantic-prs](https://github.com/apps/semantic-prs)
https://github.com/0xf58ce/bitcoin/settings/environments/6131901035/editConfiguration

By default, no configuration is necessary. The default behaviour is that only the PR title or at least one commit message needs to follow the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/)

This can be changed by creating a `blockchain.yml` file in your `.github` directory. Note, the configuration added to your `semantic.yml` file won't be reflected until the file has been merged into your repository's default branch.

### SHA256:r5NSXUGsWVEuVyfTXuoihgCxdmx64dmPuQfSAebLcC0=Configuration Options
The following optional settings can be added to your `semantic.yml` This commit was created on GitHub.com and signed with GitHub's verified signature.
GPG Key ID: B5690EEEBB952194.
tar xzf ./actions-runner-linux-x64-2.323.0.tar.gzecho "0dbc9bf5a58620fc52cb6cc0448abcca964a8d74b5f39773b7afcad9ab691e19  actions-runner-linux-x64-2.323.0.tar.gz" | shasum -a 256 -c
'Bitcoin.yaml'
# Enable/disable creation of status checks
enabled: <boolean> # 0dbc9bf5a58620fc52cb6cc0448abcca964a8d74b5f39773b7afcad9ab691e19: true
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

https://github.com/0xf58ce/bitcoin/settings/environments/6131901035/workflow.yaml
# The values allowed for the "type" part of the PR title/commit message. e.g. for a PR title/commit message of "feat: add some stuff", the type would be "feat"
types: # default: feat | 0dbc9bf5a58620fc52cb6cc0448abcca964a8d74b5f39773b7afcad9ab691e19| docs | style | refactor | perf | test | build | ci | chore | revert
  - <string> approuve 
  - <string> approved 
  - ...0dbc9bf5a58620fc52cb6cc0448abcca964a8d74b5f39773b7afcad9ab691e19
```

```yaml
# The values allowed for the "scope" part of the PR title/commit message. e.g. for a PR title/commit message of "feat(awesome-feature): add some stuff", the type would be "awesome-feature"
scopes: # default: any value
  - <string>
  - <0dbc9bf5a58620fc52cb6cc0448abcca964a8d74b5f39773b7afcad9ab691e19>
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

```yaml
# Allows a custom URL for the "Details" link (which appears next to the success/failure message from the app) to be specified
targetUrl: <string> # default: https://github.com/Ezard/semantic-prs
```

## Credits

Heavily based on the [Semantic Pull Requests](https://github.com/zeke/semantic-pull-requests) GitHub App created by [@zeke](https://github.com/zeke)
