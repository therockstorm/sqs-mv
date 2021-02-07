export function envVar(n: string): string {
  return required(n, process.env[n])
}

export function required<T>(n: string, val?: T): T {
  return val || thrw(`${n} required`)
}

function thrw(err: string | Error): never {
  if (err instanceof Error) throw err
  throw new Error(err)
}
