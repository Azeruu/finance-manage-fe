import { useState, useEffect } from 'react'
import { API_URL, fetchWithAuth } from '@/lib/api'

type EvaluationData = {
    totalSalary: number
    totalAtmBalance: number
    totalExpense: number
    totalSaving: number
}

interface EvaluationTabProps {
    month: number
    year: number
    globalEvaluationData: EvaluationData | null
    refreshKey?: number
}

export function EvaluationTab({ month, year, globalEvaluationData, refreshKey }: EvaluationTabProps) {
    const [data, setData] = useState<EvaluationData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [month, year, refreshKey])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Kita fetch data aggregate untuk bulan ini
            // Di backend, kita hitung ini menggunakan rute yang mirip
            const [incomeRes, expenseRes, savingRes] = await Promise.all([
                fetchWithAuth(`${API_URL}/api/income?month=${month}&year=${year}`),
                fetchWithAuth(`${API_URL}/api/expense?month=${month}&year=${year}`),
                fetchWithAuth(`${API_URL}/api/saving?month=${month}&year=${year}`)
            ])

            const [income, expenses, savings] = await Promise.all([
                incomeRes.json(),
                expenseRes.json(),
                savingRes.json()
            ])

            const totalExpense = Array.isArray(expenses) ? expenses.reduce((a, b) => a + b.amount, 0) : 0
            const totalSaving = Array.isArray(savings) ? savings.reduce((a, b) => a + b.amount, 0) : 0

            setData({
                totalSalary: income?.salary || 0,
                totalAtmBalance: income?.atmBalance || 0,
                totalExpense,
                totalSaving
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

    const remainingBudget = monthlySalary - monthlyExpense
    const expensePercentage = monthlySalary > 0 ? (monthlyExpense / monthlySalary) * 100 : 0
    const savingPercentage = monthlySalary > 0 ? (monthlySaving / monthlySalary) * 100 : 0

    return (
        <div className="space-y-8">
            {/* GLOBAL Total (All Time) */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-xl border border-indigo-500/30 p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span>🌍</span> Evaluasi Keseluruhan (Sepanjang Waktu)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                </div>
            </div>

            {/* MONTHLY Total */}
            <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span>📅</span> Evaluasi Bulanan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                </div>

                {/* Progress Bars */}
                <div className="space-y-5 bg-slate-900/30 p-5 rounded-xl border border-slate-700/30">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">Rasio Pengeluaran dari Pendapatan</span>
                            <span className="font-medium text-rose-400">{expensePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-2.5 rounded-full ${expensePercentage > 80 ? 'bg-red-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300">Rasio Tabungan dari Pendapatan</span>
                            <span className="font-medium text-emerald-400">{savingPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="h-2.5 rounded-full bg-emerald-500"
                                style={{ width: `${Math.min(savingPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
