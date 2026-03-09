import { useState, useEffect } from 'react'
import { API_URL, fetchWithAuth } from '@/lib/api'

type Expense = {
    id: string
    name: string
    amount: number
    category: string
    createdAt: string
}

type Saving = {
    id: string
    instrument: string
    amount: number
    createdAt: string
}

type OtherFund = {
    id: string
    name: string
    amount: number
    createdAt: string
}

type MonthlyEvaluationData = {
    totalSalary: number
    totalAtmBalance: number
    totalExpense: number
    totalSaving: number
    totalOtherFund: number
    expenses: Expense[]
    savings: Saving[]
    otherFunds: OtherFund[]
    // createdAt:string
}

type GlobalEvaluationData = {
    totalSalary: number
    totalExpense: number
    totalSaving: number
    totalOtherFund: number
}

interface EvaluationTabProps {
    month: number
    year: number
    globalEvaluationData: GlobalEvaluationData | null
    refreshKey?: number
}

export function EvaluationTab({ month, year, globalEvaluationData, refreshKey }: EvaluationTabProps) {
    const [data, setData] = useState<MonthlyEvaluationData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [month, year, refreshKey])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Kita fetch data aggregate untuk bulan ini
            // Di backend, kita hitung ini menggunakan rute yang mirip
            const [incomeRes, expenseRes, savingRes, otherFundRes] = await Promise.all([
                fetchWithAuth(`${API_URL}/api/income?month=${month}&year=${year}`),
                fetchWithAuth(`${API_URL}/api/expense?month=${month}&year=${year}`),
                fetchWithAuth(`${API_URL}/api/saving?month=${month}&year=${year}`),
                fetchWithAuth(`${API_URL}/api/other-fund?month=${month}&year=${year}`)
            ])

            const [income, expenses, savings, otherFunds] = await Promise.all([
                incomeRes.json(),
                expenseRes.json(),
                savingRes.json(),
                otherFundRes.json()
            ])

            const totalExpense = Array.isArray(expenses) ? expenses.reduce((a, b) => a + b.amount, 0) : 0
            const totalSaving = Array.isArray(savings) ? savings.reduce((a, b) => a + b.amount, 0) : 0
            const totalOtherFund = Array.isArray(otherFunds) ? otherFunds.reduce((a, b) => a + b.amount, 0) : 0

            setData({
                totalSalary: income?.salary || 0,
                totalAtmBalance: income?.atmBalance || 0,
                totalExpense,
                totalSaving,
                totalOtherFund,
                expenses: Array.isArray(expenses) ? expenses : [],
                savings: Array.isArray(savings) ? savings : [],
                otherFunds: Array.isArray(otherFunds) ? otherFunds : [],
                // createdAt,
            })
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-slate-400 py-8 text-center animate-pulse">Menghitung data evaluasi...</div>

    // Kalkulasi statistik untuk bulan ini
    const salary = data?.totalSalary || 0
    const atmBalance = data?.totalAtmBalance || 0
    const monthlySalary = salary + atmBalance
    const monthlyExpense = data?.totalExpense || 0
    const monthlySaving = data?.totalSaving || 0
    const monthlyOtherFund = data?.totalOtherFund || 0

    const remainingBudget = monthlySalary + monthlyOtherFund - monthlyExpense

    return (
        <div className="space-y-8">
            {/* GLOBAL Total (All Time) */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl border border-indigo-500/30 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span>🌍</span> Evaluasi Keseluruhan (Sepanjang Waktu)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Pendapatan</p>
                        <p className="text-xl font-bold text-blue-400">Rp {globalEvaluationData?.totalSalary?.toLocaleString('id-ID') || 0}</p>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Pengeluaran</p>
                        <p className="text-xl font-bold text-rose-400">Rp {globalEvaluationData?.totalExpense?.toLocaleString('id-ID') || 0}</p>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Tabungan</p>
                        <p className="text-xl font-bold text-emerald-400">Rp {globalEvaluationData?.totalSaving?.toLocaleString('id-ID') || 0}</p>
                    </div>
                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Dana Lainnya</p>
                        <p className="text-xl font-bold text-amber-400">Rp {globalEvaluationData?.totalOtherFund?.toLocaleString('id-ID') || 0}</p>
                    </div>
                </div>
            </div>

            {/* MONTHLY Total */}
            <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span>📅</span> Evaluasi Bulanan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Sisa Anggaran</p>
                        <p className={`text-xl font-bold ${remainingBudget >= 0 ? 'text-white' : 'text-rose-400'}`}>
                            Rp {remainingBudget.toLocaleString('id-ID')}
                        </p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Pendapatan + Sisa ATM</p>
                        <p className="text-xl font-bold text-blue-400">Rp {monthlySalary.toLocaleString('id-ID')}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Pengeluaran</p>
                        <p className="text-xl font-bold text-rose-400">Rp {monthlyExpense.toLocaleString('id-ID')}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Tabungan</p>
                        <p className="text-xl font-bold text-emerald-400">Rp {monthlySaving.toLocaleString('id-ID')}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Dana Lainnya</p>
                        <p className="text-xl font-bold text-amber-400">Rp {monthlyOtherFund.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Rincian Transaksi Bulan Ini</h3>

                    {/* Expenses */}
                    <div>
                        <h4 className="text-md font-semibold text-rose-400 mb-2">Pengeluaran</h4>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-2">
                            {data?.expenses.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.category} - {new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <p className="text-rose-400 font-medium">-Rp {item.amount.toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                            {data?.expenses.length === 0 && <p className="text-slate-400 text-sm">Tidak ada data pengeluaran bulan ini.</p>}
                        </div>
                    </div>

                    {/* Savings */}
                    <div>
                        <h4 className="text-md font-semibold text-emerald-400 mb-2">Tabungan</h4>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-2">
                            {data?.savings.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white">{item.instrument}</p>
                                        <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <p className="text-emerald-400 font-medium">+Rp {item.amount.toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                            {data?.savings.length === 0 && <p className="text-slate-400 text-sm">Tidak ada data tabungan bulan ini.</p>}
                        </div>
                    </div>

                    {/* Other Funds */}
                    <div>
                        <h4 className="text-md font-semibold text-amber-400 mb-2">Dana Lainnya</h4>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 space-y-2">
                            {data?.otherFunds.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white">{item.name}</p>
                                        <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <p className="text-amber-400 font-medium">+Rp {item.amount.toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                            {data?.otherFunds.length === 0 && <p className="text-slate-400 text-sm">Tidak ada data dana lainnya bulan ini.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
