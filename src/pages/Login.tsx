import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL, fetchWithAuth } from '@/lib/api'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Google SVG Icon
function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    )
}

export default function Login() {
    const navigate = useNavigate()

    // Cek jika user sudah login, langsung redirect ke dashboard
    useEffect(() => {
        fetchWithAuth(`${API_URL}/api/auth/me`)
            .then((res) => {
                if (res.ok) navigate('/dashboard', { replace: true })
            })
            .catch(() => { })
    }, [navigate])

    const handleGoogleLogin = () => {
        // Redirect ke backend OAuth endpoint
        window.location.href = `${API_URL}/api/auth/google`
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Background decorative blobs */}
            <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden pointer-events-none"
            >
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>

            <Dialog open>
                <DialogContent
                    className="bg-slate-900/90 border-slate-700/50 backdrop-blur-xl text-white max-w-sm"
                    onInteractOutside={(e: Event) => e.preventDefault()} // tidak bisa ditutup
                >
                    {/* Logo / Icon */}
                    <div className="flex justify-center mb-2">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                    </div>

                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-white">
                            Finance Manager
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm mt-1">
                            Kelola keuanganmu dengan mudah dan cerdas
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Button
                            onClick={handleGoogleLogin}
                            variant="outline"
                            className="w-full h-11 bg-white hover:bg-gray-50 text-gray-800 border-gray-200 font-medium gap-3 cursor-pointer transition-all duration-200 hover:shadow-md"
                        >
                            <GoogleIcon />
                            Masuk dengan Google
                        </Button>

                        <p className="text-center text-xs text-slate-500 pt-2">
                            Dengan masuk, kamu menyetujui{' '}
                            <span className="text-blue-400 cursor-pointer hover:underline">
                                Syarat & Ketentuan
                            </span>
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
