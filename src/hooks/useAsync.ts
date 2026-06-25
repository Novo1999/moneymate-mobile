import { useCallback, useEffect, useState } from 'react'

type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

/** Minimal data-fetching hook: runs `fn` whenever `deps` change, with manual reload. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[], enabled = true): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(enabled)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    fn()
      .then((result) => {
        if (active) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Something went wrong')
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled])

  return { data, loading, error, reload }
}
