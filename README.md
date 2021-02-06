# sqs-mv

An AWS Lambda function that moves SQS messages from one queue to another.

## Setup

- Install/update nvm, `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`
- Clone this repository, cd into it, and run `nvm install && nvm use && yarn`

## Developing

- Run tests, `yarn test`
- Invoke locally, `yarn invoke:local`
- Deploy, `yarn deploy`
