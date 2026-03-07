import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { API_URL, fetchWithAuth, setToken, removeToken } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { IncomeTab } from '../components/dashboard/IncomeTab'
import { ExpenseTab } from '../components/dashboard/ExpenseTab'
import { SavingTab } from '../components/dashboard/SavingTab'
import { EvaluationTab } from '../components/dashboard/EvaluationTab'

type User = {
    id: string
    name: string | null
    email: string
    avatar: string | null
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Global Date Selection
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Refresh Trigger
    const [refreshKey, setRefreshKey] = useState(0)

    // Tracking overall totals for header cards
    const [globalEvaluationData, setGlobalEvaluationData] = useState<any>(null)

    useEffect(() => {
        // Tangkap token dari URL query param jika baru selesai OAuth redirect
        const urlParams = new URLSearchParams(window.location.search)
        const tokenFromUrl = urlParams.get('token')

        if (tokenFromUrl) {
            setToken(tokenFromUrl)
            // Bersihkan URL bar secara diam-diam tanpa reload
            window.history.replaceState({}, document.title, window.location.pathname)
        }

        fetchWithAuth(`${API_URL}/api/auth/me`)
            .then((res) => {
                if (!res.ok) throw new Error('Unauthorized')
                return res.json() as Promise<User>
            })
            .then((data) => {
                setUser(data)
                setLoading(false)
            })
            .catch(() => {
                navigate('/', { replace: true })
            })
    }, [navigate])

    useEffect(() => {
        if (!user) return
        fetchGlobalEvaluation()
    }, [user, refreshKey])

    const fetchGlobalEvaluation = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/api/evaluation`)
            if (res.ok) {
                const data = await res.json()
                setGlobalEvaluationData(data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleLogout = async () => {
        await fetchWithAuth(`${API_URL}/api/auth/logout`, {
            method: 'POST'
        })
        removeToken()
        navigate('/', { replace: true })
    }

    const triggerUpdate = () => {
        setRefreshKey(prev => prev + 1)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Memuat...</p>
                </div>
            </div>
        )
    }

    // Header values based on Global fetch
    const gIncome = globalEvaluationData?.totalSalary || 0
    const gExpense = globalEvaluationData?.totalExpense || 0
    const gSaving = globalEvaluationData?.totalSaving || 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
            {/* Navbar */}
            <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <span className="text-xl">💰</span>
                        </div>
                        <span className="font-bold text-white tracking-wide">FinanceManager</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user?.avatar && (
                            <img
                                src={user.avatar}
                                alt={user.name ?? 'User'}
                                className="w-8 h-8 rounded-full ring-2 ring-slate-700"
                            />
                        )}
                        <span className="text-sm font-medium text-slate-300 hidden sm:block">{user?.name}</span>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-rose-500/20"
                        >
                            Keluar
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Welcome & Global Summary */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Halo, {user?.name?.split(' ')[0] ?? 'Pengguna'} 👋
                        </h1>
                        <p className="text-slate-400">Berikut adalah ringkasan keuanganmu secara keseluruhan.</p>
                    </div>

                    {/* Month/Year Selector */}
                    <div className="flex items-center gap-3 bg-slate-800/60 p-2 rounded-lg border border-slate-700">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-slate-900 text-white border border-slate-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-slate-900 text-white border border-slate-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-blue-500/10 to-transparent p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📈</div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Total Pendapatan</p>
                        <h3 className="text-3xl font-bold text-blue-400">Rp {gIncome.toLocaleString('id-ID')}</h3>
                    </div>
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-rose-500/10 to-transparent p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📉</div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Total Pengeluaran</p>
                        <h3 className="text-3xl font-bold text-rose-400">Rp {gExpense.toLocaleString('id-ID')}</h3>
                    </div>
                    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💎</div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Total Tabungan</p>
                        <h3 className="text-3xl font-bold text-emerald-400">Rp {gSaving.toLocaleString('id-ID')}</h3>
                    </div>
                </div>

                {/* Dashboard Tabs Area */}
                <Tabs defaultValue="gaji" className="w-full">
                    <TabsList className="mb-8 bg-slate-800/60 border border-slate-700/50 p-1.5 rounded-xl flex gap-1 overflow-x-auto justify-start md:justify-center">
                        <TabsTrigger value="gaji" className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                            💵 Data Gaji
                        </TabsTrigger>
                        <TabsTrigger value="pengeluaran" className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                            💸 Pengeluaran
                        </TabsTrigger>
                        <TabsTrigger value="tabungan" className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                            🏦 Tabungan
                        </TabsTrigger>
                        <TabsTrigger value="evaluasi" className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                            📊 Evaluasi
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="gaji" className="mt-0 outline-none">
                        <IncomeTab month={selectedMonth} year={selectedYear} onDataUpdate={triggerUpdate} />
                    </TabsContent>

                    <TabsContent value="pengeluaran" className="mt-0 outline-none">
                        <ExpenseTab month={selectedMonth} year={selectedYear} onDataUpdate={triggerUpdate} />
                    </TabsContent>

                    <TabsContent value="tabungan" className="mt-0 outline-none">
                        <SavingTab month={selectedMonth} year={selectedYear} onDataUpdate={triggerUpdate} />
                    </TabsContent>

                    <TabsContent value="evaluasi" className="mt-0 outline-none">
                        <EvaluationTab month={selectedMonth} year={selectedYear} globalEvaluationData={globalEvaluationData} refreshKey={refreshKey} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
