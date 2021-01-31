import "source-map-support/register"
import { Event } from "."
import { move } from "./move"

export async function handle(evt: Event): Promise<void> {
  console.log("Event received", evt)
  await move(evt)
}
