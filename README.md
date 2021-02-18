# sqs-mv

An AWS Lambda function that moves SQS messages from one queue to another. This is useful, for example, to move messages from a dead-letter queue (DLQ) back to the main queue after fixing a bug.

## Setup

- Install/update nvm, `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`
- Clone this repository, cd into it, and run `nvm install && nvm use && yarn`

## Developing

```shell
# Run tests
yarn test

# Format
yarn format

# Lint
yarn lint
```

## Deploying

The Lambda is deployed using [AWS CDK](https://aws.amazon.com/cdk/) with the stack defined at `./scripts/stack.ts`. 

Create a `./scripts/dev.sh` that calls `./scripts/cdk.sh` with the proper arguments. Here's an example `dev.sh` file,

```shell
#!/usr/bin/env bash

./cdk.sh \
  0123456789 \
  us-west-2 \
  "your-source-queue-name" \
  "your-destination-queue-name" \
  "$@"
```

Once that's created,

```shell
# Deploy to AWS via CDK
yarn deploy

# Remove stack via CDK
yarn destroy
```
