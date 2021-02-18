type Opaque<K, T> = T & { __TYPE__: K }

export type QueueUrl = Opaque<"QueueUrl", string>

export interface Event {
  srcUrl: QueueUrl
  dstUrl: QueueUrl
}
