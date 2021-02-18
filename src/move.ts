import { Message, SQS } from "@aws-sdk/client-sqs"
import pLimit from "p-limit"
import pWhilst from "p-whilst"
import { Event, QueueUrl } from "./types"

const limit = pLimit(50)
const sqs = new SQS({})

export async function move({ dstUrl, srcUrl }: Event): Promise<void> {
  const moveMsg = async ({ Body, ReceiptHandle }: Message) => {
    await sqs.sendMessage({ MessageBody: Body, QueueUrl: dstUrl })
    await sqs.deleteMessage({ QueueUrl: srcUrl, ReceiptHandle })
  }

  const msgs = await receiveMsgs({ url: srcUrl })
  console.log(`Moving ${msgs.length} messages from ${srcUrl} to ${dstUrl}`)
  await Promise.all(msgs.map((m) => limit<Message[], unknown>(moveMsg, m)))
}

async function receiveMsgs(args: { url: QueueUrl }) {
  let stop = false
  let msgs = [] as Message[]
  await pWhilst(
    () => !stop,
    async () => {
      const batch = await receiveBatch(args)
      batch && batch.length ? (msgs = msgs.concat(batch)) : (stop = true)
    }
  )
  return msgs
}

async function receiveBatch({ url }: { url: QueueUrl }) {
  return (
    await sqs.receiveMessage({
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ["All"],
      QueueUrl: url,
      VisibilityTimeout: 10,
    })
  ).Messages
}
