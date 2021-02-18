import { Key } from "@aws-cdk/aws-kms"
import { Runtime } from "@aws-cdk/aws-lambda"
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs"
import { IQueue, Queue } from "@aws-cdk/aws-sqs"
import { App, Construct, Duration, Stack, StackProps } from "@aws-cdk/core"
import { join } from "path"
import { envVar } from "../src/util"
import { name } from "../package.json"

interface Props extends StackProps {
  functionName: string
  /** Provide if your queues are encrypted */
  kmsKeyId?: string
  queueNames: {
    dst: string
    src: string
  }
}

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const srcQueue = this.fromQueueName("SrcQueue", props.queueNames.src)
    const dstQueue = this.fromQueueName("DstQueue", props.queueNames.dst)
    const func = new NodejsFunction(this, "Func", {
      bundling: { minify: true, sourceMap: true },
      entry: join(__dirname, "..", "src", "handler.ts"),
      environment: {
        SRC_URL: srcQueue.queueUrl,
        DST_URL: dstQueue.queueUrl,
      },
      functionName: props.functionName,
      handler: "handle",
      logRetention: 7,
      memorySize: 1024,
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.minutes(2),
    })

    if (props.kmsKeyId != null) {
      const key = Key.fromKeyArn(
        this,
        "SqsKey",
        `arn:aws:kms:${this.region}:${this.account}:key/${props.kmsKeyId}`
      )
      key.grantDecrypt(func)
    }

    srcQueue.grantConsumeMessages(func)
    dstQueue.grantSendMessages(func)
  }

  fromQueueName(id: string, queueName: string): IQueue {
    return Queue.fromQueueArn(
      this,
      id,
      `arn:aws:sqs:${this.region}:${this.account}:${queueName}`
    )
  }
}

const AwsProfile = envVar("AWS_PROFILE")
const app = new App()
new MyStack(app, "Stack", {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  },
  functionName: `sqs-mv-func-${AwsProfile}`,
  kmsKeyId: process.env.SQS_MV_KMS_KEY_ID,
  queueNames: {
    dst: envVar("SQS_MV_DST_QUEUE_NAME"),
    src: envVar("SQS_MV_SRC_QUEUE_NAME"),
  },
  tags: {
    Creator: "cdk",
    Environment: AwsProfile,
    Project: name,
    Revision: process.env.GIT_SHORT_REV || "",
  },
})
