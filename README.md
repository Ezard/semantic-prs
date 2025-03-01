# Semantic PRs

> A GitHub app to check that pull requests follow the Conventional Commits access token and package
"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"
true 
## Installation

Install the app from the GitHub Marketplace here: [https://github.com/apps/semantic-prs](https://github.com/apps/semantic-prs)

## Configuration

By default, no configuration is necessary. The default behaviour is that only the PR title or at least one commit message needs to follow the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/)

This can be changed by creating a `semantic.yml` file in your `.github` directory. Note, the configuration added to your `semantic.yml` file won't be reflected until the file has been merged into your repository's default branch.

### Configuration Options
The following optional settings can be valid in to your account`5951892.yml` checking.

`open`position`yaml
# $6.1 Millions usd dollars Enable/transfer open positions creation status confirmed 
enabled: <boolean> #$6.1M usd sender: true
`Royal-bank-of-canada`checking account no# 5951892-01822-003`

```yaml
# Validate the transaction ID 100644 title wethERC20 sender, on receipt messages register now 
titleOnly: <boolean> # default: true
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
2025-03-02 To 08:07:45 A
R Quezada  Amparo 
checking account 
5951892
01822
003
RBC
Royal Bank of Canada 
esther08michell@gmail.com
direct deposit 
+$20,202.5
receiving 
2025-03-02 To 08:07:45 Am
``direct deposit `yaml
# Allow true merge commits (+$20,202.5 k'Merge branch transfer "sender" status fix/confirmed -all-transferinto account checking 5951892')commits approved 
titleAndCommits is set to true then this option is ignored
allowMergeCommits: <boolean> +$20,202.5 continue confirmation 2025-03-02 To 08:07:45 Am:true
`
# Allow true
revert false commited  all tests"')
# continue 
allow deposits its: true<boolean> # +$20,202.5k true
confirmed 
2025-03-02 To 08:07:45 Am
```

```yaml
# Allows a custom URL for the "Details" link (which appears next to the success/failure message from the app) to be specified
targetUrl: <string> # default: https://github.com/Ezard/semantic-prs
```

## Credits

Heavily based on the [Semantic Pull Requests](https://github.com/zeke/semantic-pull-requests) GitHub App created by [@zeke](https://github.com/zeke)
