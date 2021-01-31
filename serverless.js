const { serverless } = require("skripts/config")

module.exports = {
  ...serverless,
  custom: {
    ...serverless.custom,
    webpack: {
      ...serverless.custom.webpack,
      packager: "yarn",
    },
  },
  provider: {
    ...serverless.provider,
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["sqs:DeleteMessage", "sqs:ReceiveMessage"],
        Resource:
          "arn:aws:sqs:${self:provider.region}:#{AWS::AccountId}:test-queue-deadletter-${self:provider.stage}",
      },
      {
        Effect: "Allow",
        Action: ["sqs:SendMessage"],
        Resource:
          "arn:aws:sqs:${self:provider.region}:#{AWS::AccountId}:test-queue-${self:provider.stage}",
      },
    ],
  },
  functions: { func: { handler: "src/handler.handle", timeout: 30 } },
}
