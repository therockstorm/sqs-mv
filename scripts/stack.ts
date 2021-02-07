import { Key } from "@aws-cdk/aws-kms"
import { Runtime } from "@aws-cdk/aws-lambda"
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs"
import { IQueue, Queue } from "@aws-cdk/aws-sqs"
import { App, Construct, Duration, Stack, StackProps } from "@aws-cdk/core"
import { join } from "path"
import { envVar } from "../src/util"
import { name } from "../package.json"

const AwsProfile = envVar("AWS_PROFILE")

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const srcQueue = this.fromQueueName("SrcQueue", "SQS_MV_SRC_QUEUE_NAME")
    const dstQueue = this.fromQueueName("DstQueue", "SQS_MV_DST_QUEUE_NAME")
    const func = new NodejsFunction(this, "Func", {
      bundling: { minify: true, sourceMap: true },
      entry: join(__dirname, "..", "src", "handler.ts"),
      environment: {
        SRC_URL: srcQueue.queueUrl,
        DST_URL: dstQueue.queueUrl,
      },
      functionName: `sqs-mv-func-${AwsProfile}`,
      handler: "handle",
      logRetention: 7,
      memorySize: 1024,
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.minutes(2),
    })

    const key = Key.fromKeyArn(
      this,
      "SqsKey",
      `arn:aws:kms:${this.region}:${this.account}:key/${envVar(
        "SQS_MV_KMS_KEY_ID"
      )}`
    )

    key.grantDecrypt(func)
    srcQueue.grantConsumeMessages(func)
    dstQueue.grantSendMessages(func)
  }

  fromQueueName(id: string, ev: string): IQueue {
    return Queue.fromQueueArn(
      this,
      id,
      `arn:aws:sqs:${this.region}:${this.account}:${envVar(ev)}`
    )
  }
}

const app = new App()
new MyStack(app, "Stack", {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || envVar("CDK_DEFAULT_ACCOUNT"),
    region: process.env.CDK_DEPLOY_REGION || envVar("CDK_DEFAULT_REGION"),
  },
  tags: {
    Creator: "cdk",
    Environment: AwsProfile,
    Project: name,
  },
})
