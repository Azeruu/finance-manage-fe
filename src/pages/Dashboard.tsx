import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { API_URL, fetchWithAuth, setClerkGetToken } from '@/lib/api'
import { useAuth, useUser } from '@clerk/clerk-react'
import { Menu, X, LayoutDashboard, Banknote, CreditCard, Wallet, CircleDollarSign, LogOut } from 'lucide-react'
import { DashboardOverview } from '../components/dashboard/DashboardOverview'
import { IncomeTab } from '../components/dashboard/IncomeTab'
import { ExpenseTab } from '../components/dashboard/ExpenseTab'
import { SavingTab } from '../components/dashboard/SavingTab'
import { OtherFundTab } from '../components/dashboard/OtherFundTab'
import { EvaluationTab } from '../components/dashboard/EvaluationTab'
import { RecentExpenseTab } from '../components/dashboard/RecentExpenseTab'

type User = {
    id: string
    name: string | null
    email: string
    avatar: string | null
}

type GlobalEvaluationData = {
    totalSalary: number
    totalExpense: number
    totalSaving: number
    totalOtherFund: number
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { isLoaded, isSignedIn, user: clerkUser } = useUser()
    const { getToken, signOut } = useAuth()

    // Global Date Selection
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Refresh Trigger
    const [refreshKey, setRefreshKey] = useState(0)

    // Tracking overall totals for header cards
    const [globalEvaluationData, setGlobalEvaluationData] = useState<GlobalEvaluationData | null>(null)

    // Layout State
    const [activeTab, setActiveTab] = useState('overview')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        setClerkGetToken(getToken)
    }, [getToken])

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/', { replace: true })
        }
    }, [isLoaded, isSignedIn, navigate])

    const user: User | null = clerkUser ? {
        id: clerkUser.id,
        name: clerkUser.fullName,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        avatar: clerkUser.imageUrl
    } : null;

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

    useEffect(() => {
        if (!user) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchGlobalEvaluation()
    }, [user, refreshKey])

    const handleLogout = async () => {
        await signOut()
        navigate('/', { replace: true })
    }

    const triggerUpdate = () => {
        setRefreshKey(prev => prev + 1)
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Memuat...</p>
                </div>
            </div>
        )
    }

    const navItems = [
        { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },
        { id: 'gaji', label: 'Data Gaji', icon: <Banknote size={20} /> },
        { id: 'pengeluaran', label: 'Pengeluaran', icon: <CreditCard size={20} /> },
        { id: 'tabungan', label: 'Tabungan', icon: <Wallet size={20} /> },
        { id: 'dana-lainnya', label: 'Dana Lainnya', icon: <CircleDollarSign size={20} /> },
        { id: 'evaluasi', label: 'Evaluasi Lengkap', icon: <LayoutDashboard size={20} /> }, // Evaluation uses same icon or similar
        { id: 'pengeluaran-terkini', label: 'Pengeluaran Terkini', icon: <CreditCard size={20} /> },
    ]

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden">

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:relative inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <span className="text-xl">💰</span>
                        </div>
                        <span className="font-bold text-white tracking-wide truncate">FinanceMgr</span>
                    </div>
                    <button
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false); // Close on mobile after click
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === item.id
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* User Profile Area (Bottom) */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full ring-2 ring-slate-700 flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 py-2 h-auto"
                    >
                        <LogOut size={18} className="mr-2" />
                        Keluar
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header Navbar */}
                <header className="h-16 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-slate-300 hover:text-white p-1"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-semibold text-white truncate hidden sm:block">
                            {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
                        </h1>
                    </div>

                        <div className="flex items-center gap-3 bg-slate-800/60 p-1.5 rounded-lg border border-slate-700">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-transparent text-sm text-white border-0 px-2 py-1 focus:ring-0 outline-none cursor-pointer"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m} className="bg-slate-800 text-white">
                                        {new Date(0, m - 1).toLocaleString('id-ID', { month: 'short' })}
                                    </option>
                                ))}
                            </select>
                            <div className="w-px h-4 bg-slate-600"></div>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-transparent text-sm text-white border-0 px-2 py-1 focus:ring-0 outline-none cursor-pointer"
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                    <option key={y} value={y} className="bg-slate-800 text-white">{y}</option>
                                ))}
                            </select>
                        </div>
                </header>

                {/* Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">

                        {/* Render active tab content */}
                        <div className="mb-20">
                            {activeTab === 'overview' && (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            Halo, {user?.name?.split(' ')[0] ?? 'Pengguna'} 👋
                                        </h2>
                                        <p className="text-slate-400">Berikut adalah ringkasan keuanganmu secara keseluruhan.</p>
                                    </div>
                                    <DashboardOverview
                                        globalEvaluationData={globalEvaluationData}
                                        year={selectedYear}
                                        refreshKey={refreshKey}
                                    />
                                </>
                            )}
                            {activeTab === 'gaji' && <IncomeTab month={selectedMonth} year={selectedYear} onDataUpdate={triggerUpdate} />}
                            {activeTab === 'pengeluaran' && <ExpenseTab month={selectedMonth} year={selectedYear} onDataUpdate={triggerUpdate} />}
                            {activeTab === 'tabungan' && <SavingTab month={selectedMonth} year={selectedYear} onDataUpdate={triggerUpdate} />}
                            {activeTab === 'dana-lainnya' && <OtherFundTab month={selectedMonth} year={selectedYear} onDataUpdate={triggerUpdate} />}
                            {activeTab === 'evaluasi' && <EvaluationTab month={selectedMonth} year={selectedYear} globalEvaluationData={globalEvaluationData} refreshKey={refreshKey} />}
                            {activeTab === 'pengeluaran-terkini' && <RecentExpenseTab onDataUpdate={triggerUpdate} />}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
