export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Token helper for Clerk
let clerkGetToken: (() => Promise<string | null>) | null = null;

export const setClerkGetToken = (fn: typeof clerkGetToken) => {
  clerkGetToken = fn;
}

// Helper untuk fetch dengan Authorization header otomatis ditambahkan
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = clerkGetToken ? await clerkGetToken() : null;
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, {
    ...options,
    credentials: 'omit', // Karena kita sudah pakai Bearer token dari Clerk sekarang
    headers,
  })
}
