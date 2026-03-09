import { useEffect, useState } from 'react'
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
    const [isTermsOpen, setIsTermsOpen] = useState(false)

    // Cek jika user sudah login, langsung redirect ke dashboard
    useEffect(() => {
        fetchWithAuth(`${API_URL}/api/auth/me`)
            .then((res) => {
                if (res.ok) navigate('/dashboard', { replace: true })
            })
            .catch(() => { })
    }, [navigate])

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/api/auth/google`
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4">
            {/* Background decorative blobs */}
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            {/* Branding Section (Outside Card) */}
            <div className="text-center mb-10 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-center mb-6">
                        {/* <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg> */}
                        <img src="/logoFinance.png" className='w-100 h-55 -mb-21' alt="" />

                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Finance Manager
                </h1>
                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                    Kelola aliran kas Anda secara cerdas dengan sinkronisasi Google Sheets otomatis.
                </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-sm bg-slate-900/50 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-500 delay-200">
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-1">Selamat Datang</h2>
                        <p className="text-slate-500 text-sm">Masuk untuk mulai mencatat</p>
                    </div>

                    <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full h-14 bg-white hover:bg-slate-100 text-slate-950 border-none font-bold text-base gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl rounded-2xl"
                    >
                        <GoogleIcon />
                        Masuk dengan Google
                    </Button>

                    <p className="text-center text-xs text-slate-500 pt-2 leading-relaxed">
                        Dengan melanjutkan, Anda menyetujui{' '}
                        <button
                            onClick={() => setIsTermsOpen(true)}
                            className="text-blue-400 font-medium hover:text-blue-300 underline-offset-4 hover:underline focus:outline-none transition-colors"
                        >
                            Syarat & Kebijakan Privasi
                        </button>
                    </p>
                </div>
            </div>

            {/* Terms Modal (Centered Scrollable Dialog) */}
            <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl">
                    <DialogHeader className="p-6 border-b border-slate-800 shrink-0">
                        <DialogTitle className="text-white text-2xl font-bold">Syarat, Ketentuan & Kebijakan Privasi</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Penting untuk memahami bagaimana kami mengelola data Anda.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        <section>
                            <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                1. Akses Data Google
                            </h3>
                            <div className="space-y-3 text-slate-300">
                                <p>Aplikasi ini memerlukan izin akses terbatas ke akun Google Anda untuk fitur inti:</p>
                                <ul className="grid grid-cols-1 gap-3">
                                    <li className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <span className="text-white font-semibold block mb-1">Identitas Dasar</span>
                                        Email dan Nama Anda digunakan hanya untuk pembuatan profil akun di sistem kami.
                                    </li>
                                    <li className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <span className="text-white font-semibold block mb-1">Google Sheets</span>
                                        Izin menulis dan membaca digunakan untuk mencatat setiap transaksi langsung ke file Spreadsheet di Drive Anda.
                                    </li>
                                    <li className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                        <span className="text-white font-semibold block mb-1">Google Drive</span>
                                        Hanya digunakan untuk menyalin template keuangan awal ke ruang penyimpanan Drive pribadi Anda.
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                2. Keamanan & Kerahasiaan
                            </h3>
                            <div className="space-y-3 text-slate-300">
                                <p>Kami menerapkan standar keamanan tinggi:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Data finansial Anda <strong>TIDAK PERNAH</strong> kami jual, bagikan, atau berikan kepada pihak eksternal manapun.</li>
                                    <li>Token akses Google Anda dienkripsi dengan standar industri di server kami.</li>
                                    <li>Aplikasi hanya memiliki akses ke file yang dibuatnya sendiri (scope drive.file).</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-blue-400 font-bold text-lg mb-3 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                3. Penyimpanan Data
                            </h3>
                            <p className="text-slate-300">
                                Transaksi Anda dicatat di database kami untuk fungsi Dashboard/Grafik cepat, dan secara paralel disinkronkan ke Google Sheets Anda sebagai arsip permanen milik Anda sepenuhnya.
                            </p>
                        </section>

                        <section className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20">
                            <p className="text-sm text-slate-400 italic text-center">
                                "Finance Manager mematuhi sepenuhnya Kebijakan Data Pengguna Layanan Google API, termasuk kepatuhan terhadap persyaratan Penggunaan Terbatas."
                            </p>
                        </section>
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur shrink-0 flex justify-end">
                        <Button 
                            onClick={() => setIsTermsOpen(false)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 rounded-xl"
                        >
                            Saya Mengerti
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    )
}

