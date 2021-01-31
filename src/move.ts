import { Message, SQS } from "@aws-sdk/client-sqs"
import pLimit from "p-limit"
import pWhilst from "p-whilst"
import { Event } from "."

const limit = pLimit(50)
const sqs = new SQS({})

export async function move(evt: Event): Promise<void> {
  if (!evt.srcUrl) throw new Error("srcUrl required")
  if (!evt.dstUrl) throw new Error("dstUrl required")

  const moveMsg = async (m: Message) => {
    await sendMessage(evt.dstUrl, m.Body)
    await deleteMessage(evt.srcUrl, m.ReceiptHandle)
  }

  const msgs = await receiveMsgs(evt.srcUrl)
  await Promise.all(msgs.map((m) => limit<Message[], unknown>(moveMsg, m)))
  console.log(`Moved ${msgs.length} messages`)
}

async function receiveMsgs(url: string) {
  let stop = false
  let msgs = [] as Message[]
  await pWhilst(
    () => !stop,
    async () => {
      const batch = await receiveBatch(url)
      batch ? (msgs = msgs.concat(batch)) : (stop = true)
    }
  )
  return msgs
}

async function receiveBatch(url: string) {
  return (
    await sqs.receiveMessage({
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ["All"],
      QueueUrl: url,
      VisibilityTimeout: 10,
    })
  ).Messages
}

async function sendMessage(url: string, body?: string) {
  return sqs.sendMessage({ MessageBody: body, QueueUrl: url })
}

async function deleteMessage(url: string, receiptHandle?: string) {
  return sqs.deleteMessage({ QueueUrl: url, ReceiptHandle: receiptHandle })
}
