import { Key } from "@aws-cdk/aws-kms"
import { Runtime } from "@aws-cdk/aws-lambda"
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs"
import { Queue } from "@aws-cdk/aws-sqs"
import { App, Construct, Duration, Stack, StackProps } from "@aws-cdk/core"
import { join } from "path"
import { name } from "../package.json"

const AwsAccountId = "XXX"
const AwsProfile = process.env.AWS_PROFILE || ""
const AwsRegion = "us-west-2"
const KeyId = "YYY"
const QueueName = "ZZZ"

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const func = new NodejsFunction(this, "Func", {
      bundling: { minify: true, sourceMap: true },
      entry: join(__dirname, "..", "src", "handler.ts"),
      handler: "handle",
      memorySize: 1024,
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.minutes(2),
    })

    const key = Key.fromKeyArn(
      this,
      "SqsKey",
      `arn:aws:kms:${AwsRegion}:${AwsAccountId}:key/${KeyId}`
    )
    key.grantDecrypt(func)

    const queue = Queue.fromQueueArn(
      this,
      "DstQueue",
      `arn:aws:sqs:${AwsRegion}:${AwsAccountId}:${QueueName}-${AwsProfile}`
    )
    queue.grantSendMessages(func)

    const deadletterQueue = Queue.fromQueueArn(
      this,
      "SrcQueue",
      `arn:aws:sqs:${AwsRegion}:${AwsAccountId}:${QueueName}-deadletter-${AwsProfile}`
    )
    deadletterQueue.grantConsumeMessages(func)
  }
}

const app = new App()
new MyStack(app, "Stack", {
  tags: {
    Creator: "cdk",
    Environment: AwsProfile,
    Project: name,
  },
})
