import "source-map-support/register"
import { Event, QueueUrl } from "./types"
import { move } from "./move"
import { envVar } from "./util"

const evt: Event = {
  srcUrl: envVar("SRC_URL") as QueueUrl,
  dstUrl: envVar("DST_URL") as QueueUrl,
}

export async function handle(): Promise<void> {
  await move(evt)
}
