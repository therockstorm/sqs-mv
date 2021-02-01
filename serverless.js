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
        Action: ["kms:Decrypt"],
        Resource: "arn:aws:kms:${self:provider.region}:#{AWS::AccountId}:key/*",
      },
      {
        Effect: "Allow",
        Action: ["sqs:DeleteMessage", "sqs:ReceiveMessage", "sqs:SendMessage"],
        Resource: "arn:aws:sqs:${self:provider.region}:#{AWS::AccountId}:*",
      },
    ],
    memorySize: 1024,
  },
  functions: { func: { handler: "src/handler.handle", timeout: 120 } },
}
