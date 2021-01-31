import { SQS } from "@aws-sdk/client-sqs"

jest.mock("@aws-sdk/client-sqs")
const sqs = (SQS as unknown) as jest.Mock
const deleteMessage = jest.fn()
const receiveMessage = jest.fn()
const sendMessage = jest.fn()
sqs.mockImplementationOnce(() => ({
  deleteMessage,
  receiveMessage,
  sendMessage,
}))

import { move } from "../src/move"

describe("move", () => {
  const srcUrl = "su"
  const dstUrl = "du"
  const body = "b"
  const receiptHandle = "rh"

  afterEach(() => {
    deleteMessage.mockReset()
    receiveMessage.mockReset()
    sendMessage.mockReset()
  })

  it("throws if missing srcUrl", async () =>
    expect(move({ srcUrl: "", dstUrl: dstUrl })).rejects.toThrow(
      "srcUrl required"
    ))

  it("throws if missing dstUrl", async () => {
    mockReceive({
      Messages: [{ Body: "b", MessageAttributes: {}, ReceiptHandle: "rh" }],
    })
    mockReceive({})

    await expect(move({ srcUrl: srcUrl, dstUrl: "" })).rejects.toThrow(
      "dstUrl required"
    )
  })

  it("moves if dst provided", async () => {
    mockReceive({
      Messages: [
        { Body: body, MessageAttributes: {}, ReceiptHandle: receiptHandle },
      ],
    })
    mockReceive({})
    sendMessage.mockReturnValue({})
    deleteMessage.mockReturnValue({})

    await expect(move({ srcUrl, dstUrl })).resolves.toBe(undefined)

    verify()
  })

  const mockReceive = (r: unknown) => receiveMessage.mockReturnValueOnce(r)

  const verify = () => {
    expect(receiveMessage).toHaveBeenCalledWith({
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ["All"],
      QueueUrl: srcUrl,
      VisibilityTimeout: 10,
    })
    expect(sendMessage).toHaveBeenCalledWith({
      MessageBody: body,
      QueueUrl: dstUrl,
    })
    expect(sendMessage).toHaveBeenCalledTimes(1)
    expect(deleteMessage).toHaveBeenCalledWith({
      QueueUrl: srcUrl,
      ReceiptHandle: receiptHandle,
    })
    expect(deleteMessage).toHaveBeenCalledTimes(1)
  }
})
