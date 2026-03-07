export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Utility untuk mengambil token dari localStorage
export const getToken = () => localStorage.getItem('finance_token')

// Utility untuk mengatur token ke localStorage
export const setToken = (token: string) => localStorage.setItem('finance_token', token)

// Utility untuk menghapus token
export const removeToken = () => localStorage.removeItem('finance_token')

// Helper untuk fetch dengan Authorization header otomatis ditambahkan
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Kita tetap menyimpan include credentials jika suatu saat butuh fallback ke cookies
  return fetch(url, {
    ...options,
    credentials: 'omit', // Karena kita sudah pakai Bearer token sekarang
    headers,
  })
}
