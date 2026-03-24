import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignInButton, useUser, SignedOut } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

export default function Login() {
    const navigate = useNavigate()
    const { isLoaded, isSignedIn } = useUser()

    // Cek jika user sudah login, langsung redirect ke dashboard
    useEffect(() => {
        if (isLoaded && isSignedIn) navigate('/dashboard', { replace: true })
    }, [isLoaded, isSignedIn, navigate])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4">
            {/* Background decorative blobs */}
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            {/* Branding Section */}
            <div className="text-center mb-10 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-center mb-6">
                        <img src="/logoFinance.png" className='w-100 h-55 -mb-21' alt="Finance Manager Logo" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Finance Manager
                </h1>
                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                    Kelola aliran kas Anda secara cerdas dengan sinkronisasi Google Sheets otomatis.
                </p>
            </div>

            {/* Login Selection */}
            <div className="z-10 w-full max-w-sm">
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button
                            className="w-full h-16 bg-white hover:bg-slate-100 text-slate-950 border-none font-black text-xl shadow-2xl rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                        >
                            Masuk / Mulai Sekarang
                        </Button>
                    </SignInButton>
                </SignedOut>
                
                {isLoaded && isSignedIn && (
                    <div className="text-center py-4 text-blue-400 font-medium animate-pulse">
                        Menyiapkan dashboard Anda...
                    </div>
                )}

                {!isLoaded && (
                    <div className="text-center py-4 text-slate-600 text-xs animate-pulse">
                        Menghubungkan ke layanan keamanan...
                    </div>
                )}
            </div>
            
            <div className="mt-12 z-10 text-center max-w-md text-xs text-slate-500 leading-relaxed bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                <p className="font-bold text-slate-400 mb-2 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Sistem Keamanan Baru Aktif
                </p>
                Aplikasi sekarang menggunakan integrasi Clerk & Google Service Account. Data Anda aman dan otomatis tersinkronisasi ke Google Sheets tanpa resiko keamanan tambahan.
            </div>
        </div>
    )
}
