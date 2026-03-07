import { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'
import { API_URL, fetchWithAuth } from '@/lib/api'

interface DashboardOverviewProps {
    globalEvaluationData: any
    year: number
    refreshKey: number
}

type ChartData = {
    month: number
    pendapatan: number
    pengeluaran: number
    tabungan: number
    danaLainnya: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

const COLORS = {
    pendapatan: '#3b82f6', // blue-500
    pengeluaran: '#f43f5e', // rose-500
    tabungan: '#10b981', // emerald-500
    danaLainnya: '#f59e0b' // amber-500
}

export function DashboardOverview({ globalEvaluationData, year, refreshKey }: DashboardOverviewProps) {
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true)
            try {
                const res = await fetchWithAuth(`${API_URL}/api/evaluation/chart?year=${year}`)
                if (res.ok) {
                    const data = await res.json()
                    // Map to format month names
                    const formattedData = data.map((d: any) => ({
                        ...d,
                        monthName: MONTH_NAMES[d.month - 1]
                    }))
                    setChartData(formattedData)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchChartData()
    }, [year, refreshKey])

    const gIncome = globalEvaluationData?.totalSalary || 0
    const gExpense = globalEvaluationData?.totalExpense || 0
    const gSaving = globalEvaluationData?.totalSaving || 0
    const gOtherFund = globalEvaluationData?.totalOtherFund || 0

    const pieData = [
        { name: 'Pendapatan (Gaji)', value: gIncome },
        { name: 'Pengeluaran', value: gExpense },
        { name: 'Tabungan', value: gSaving },
        { name: 'Dana Lainnya', value: gOtherFund }
    ].filter(item => item.value > 0) // only show items with value > 0

    const formatRupiah = (value: number) => {
        if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`
        if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}Jt`
        if (value >= 1000) return `Rp ${(value / 1000).toFixed(1)}Rb`
        return `Rp ${value}`
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-white font-medium mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: Rp {entry.value.toLocaleString('id-ID')}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mb-10 overflow-hidden px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-blue-500/10 to-transparent p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📈</div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Total Pendapatan</p>
                    <h3 className="text-2xl font-bold text-blue-400 truncate">Rp {gIncome.toLocaleString('id-ID')}</h3>
                </div>
                <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-rose-500/10 to-transparent p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📉</div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Total Pengeluaran</p>
                    <h3 className="text-2xl font-bold text-rose-400 truncate">Rp {gExpense.toLocaleString('id-ID')}</h3>
                </div>
                <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💎</div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Total Tabungan</p>
                    <h3 className="text-2xl font-bold text-emerald-400 truncate">Rp {gSaving.toLocaleString('id-ID')}</h3>
                </div>
                <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-amber-500/10 to-transparent p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💰</div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Dana Lainnya</p>
                    <h3 className="text-2xl font-bold text-amber-400 truncate">Rp {gOtherFund.toLocaleString('id-ID')}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart Section */}
                <div className="lg:col-span-2 bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Tren Keuangan {year}</h3>

                    {loading ? (
                        <div className="h-72 flex items-center justify-center">
                            <div className="animate-pulse text-slate-400">Loading chart...</div>
                        </div>
                    ) : (
                        <div className="w-full h-80 max-w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatRupiah}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" name="Pendapatan" dataKey="pendapatan" stroke={COLORS.pendapatan} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" name="Pengeluaran" dataKey="pengeluaran" stroke={COLORS.pengeluaran} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" name="Tabungan" dataKey="tabungan" stroke={COLORS.tabungan} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" name="Dana Lainnya" dataKey="danaLainnya" stroke={COLORS.danaLainnya} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Pie Chart Section */}
                <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Distribusi Keseluruhan</h3>
                    <p className="text-sm text-slate-400 mb-6">Persentase dari total akumulasi semua data.</p>

                    {pieData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-500">
                            Belum ada data
                        </div>
                    ) : (
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => {
                                            let color = COLORS.pendapatan
                                            if (entry.name === 'Pengeluaran') color = COLORS.pengeluaran
                                            else if (entry.name === 'Tabungan') color = COLORS.tabungan
                                            else if (entry.name === 'Dana Lainnya') color = COLORS.danaLainnya

                                            return <Cell key={`cell-${index}`} fill={color} />
                                        })}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total']}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
