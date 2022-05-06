# semantic-prs

> A GitHub App built with [Probot](https://github.com/probot/probot) that A GitHub app to check that pull request titles following the Conventional Commits spec

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t semantic-prs .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> semantic-prs
```

## Contributing

If you have suggestions for how semantic-prs could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 Ben Ezard <ezard.ben@gmail.com>
