import { Message, SQS } from "@aws-sdk/client-sqs"
import pLimit from "p-limit"
import pWhilst from "p-whilst"
import { Event, QueueUrl } from "."

const limit = pLimit(50)
const sqs = new SQS({})

export async function move(evt: Event): Promise<void> {
  const moveMsg = async (m: Message) => {
    await sendMessage(evt.dstUrl, m.Body)
    await deleteMessage(evt.srcUrl, m.ReceiptHandle)
  }

  const msgs = await receiveMsgs(evt.srcUrl)
  console.log(
    `Moving ${msgs.length} messages from ${evt.srcUrl} to ${evt.dstUrl}`
  )
  await Promise.all(msgs.map((m) => limit<Message[], unknown>(moveMsg, m)))
}

async function receiveMsgs(url: QueueUrl) {
  let stop = false
  let msgs = [] as Message[]
  await pWhilst(
    () => !stop,
    async () => {
      const batch = await receiveBatch(url)
      batch && batch.length ? (msgs = msgs.concat(batch)) : (stop = true)
    }
  )
  return msgs
}

async function receiveBatch(url: QueueUrl) {
  return (
    await sqs.receiveMessage({
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ["All"],
      QueueUrl: url,
      VisibilityTimeout: 10,
    })
  ).Messages
}

async function sendMessage(url: QueueUrl, body?: string) {
  return sqs.sendMessage({ MessageBody: body, QueueUrl: url })
}

async function deleteMessage(url: QueueUrl, receiptHandle?: string) {
  return sqs.deleteMessage({ QueueUrl: url, ReceiptHandle: receiptHandle })
}
