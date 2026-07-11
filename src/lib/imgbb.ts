const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

/**
 * Uploads a base64-encoded image to imgBB and returns the hosted URL.
 * imgBB is a plain image host — the key lives in EXPO_PUBLIC_IMGBB_API_KEY
 * and requests go straight to their API, never through our backend.
 */
export async function uploadImageToImgbb(base64: string): Promise<string> {
  const key = process.env.EXPO_PUBLIC_IMGBB_API_KEY
  if (!key) throw new Error('Missing EXPO_PUBLIC_IMGBB_API_KEY')

  const form = new FormData()
  form.append('image', base64)

  const res = await fetch(`${IMGBB_UPLOAD_URL}?key=${key}`, { method: 'POST', body: form })
  const json = await res.json().catch(() => null)
  const url = json?.data?.url
  if (!res.ok || typeof url !== 'string') {
    console.error('imgBB upload failed', { status: res.status, response: json })
    throw new Error(json?.error?.message ?? 'Image upload failed')
  }
  return url
}
