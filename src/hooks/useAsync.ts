import { useCallback, useEffect, useState } from 'react'

type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

type Settled = { key: unknown[]; error: string | null }

function sameKey(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
}

/** Minimal data-fetching hook: runs `fn` whenever `deps` change, with manual reload. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], enabled = true): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [tick, setTick] = useState(0)
  // Ground truth: the deps snapshot of the last run that settled. `loading` and
  // `error` are derived from it, so effects never set state synchronously.
  const [settled, setSettled] = useState<Settled | null>(null)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  const key = [...deps, tick]
  const isCurrent = settled !== null && sameKey(settled.key, key)
  const loading = enabled && !isCurrent
  const error = isCurrent ? settled.error : null

  useEffect(() => {
    if (!enabled) return
    let active = true
    const run = async () => {
      try {
        const result = await fn()
        if (active) {
          setData(result)
          setSettled({ key, error: null })
        }
      } catch (e) {
        if (active) {
          setSettled({ key, error: e instanceof Error ? e.message : 'Something went wrong' })
        }
      }
    }
    run()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled])

  return { data, loading, error, reload }
}
