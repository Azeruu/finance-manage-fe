import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { API_URL, fetchWithAuth } from '@/lib/api'
import { formatNumberWithDots, parseFormattedNumber } from '@/lib/utils'

type IncomeData = {
    id?: string
    salary: number
    atmBalance: number
}

interface IncomeTabProps {
    month: number
    year: number
    onDataUpdate: () => void
}

export function IncomeTab({ month, year, onDataUpdate }: IncomeTabProps) {
    const [data, setData] = useState<IncomeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)

    const [salary, setSalary] = useState('')
    const [atmBalance, setAtmBalance] = useState('')

    useEffect(() => {
        fetchData()
    }, [month, year])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetchWithAuth(`${API_URL}/api/income?month=${month}&year=${year}`)
            if (res.ok) {
                const json = await res.json()
                setData(json)
                setSalary(formatNumberWithDots(json.salary))
                setAtmBalance(formatNumberWithDots(json.atmBalance))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetchWithAuth(`${API_URL}/api/income`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month,
                    year,
                    salary: parseFloat(parseFormattedNumber(salary)) || 0,
                    atmBalance: parseFloat(parseFormattedNumber(atmBalance)) || 0
                })
            })
            if (res.ok) {
                setIsEditing(false)
                fetchData()
                onDataUpdate()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-slate-400 py-8 text-center animate-pulse">Memuat data gaji...</div>

    return (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Pendapatan Bulan Ini</h2>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                        Edit Data
                    </Button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Gaji Bulanan</label>
                            <input
                                type="text"
                                value={salary}
                                onChange={(e) => setSalary(formatNumberWithDots(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Sisa Uang di ATM</label>
                            <input
                                type="text"
                                value={atmBalance}
                                onChange={(e) => setAtmBalance(formatNumberWithDots(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                            Batal
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer">
                            Simpan
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                        <p className="text-sm text-slate-400 mb-1">Gaji Diterima</p>
                        <p className="text-3xl font-bold text-emerald-400">
                            Rp {data?.salary?.toLocaleString('id-ID') || 0}
                        </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                        <p className="text-sm text-slate-400 mb-1">Sisa di ATM</p>
                        <p className="text-3xl font-bold text-blue-400">
                            Rp {data?.atmBalance?.toLocaleString('id-ID') || 0}
                        </p>
                    </div>
                    <div className="md:col-span-2 bg-gradient-to-r from-blue-900/30 to-emerald-900/30 rounded-xl p-5 border border-slate-700/50">
                        <p className="text-sm text-slate-300 mb-1">Total Saldo Terkini</p>
                        <p className="text-4xl font-bold text-white">
                            Rp {((data?.salary || 0) + (data?.atmBalance || 0)).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
