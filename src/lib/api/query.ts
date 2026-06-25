/** Builds a `?a=1&b=2` query string, skipping null/undefined/empty values. */
export function withQuery(endpoint: string, params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const qs = search.toString()
  return qs ? `${endpoint}?${qs}` : endpoint
}
