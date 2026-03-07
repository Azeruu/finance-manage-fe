import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { API_URL, fetchWithAuth } from '@/lib/api'

type OtherFundData = {
    id: string
    name: string
    amount: number
    createdAt: string
}

interface OtherFundTabProps {
    month: number
    year: number
    onDataUpdate: () => void
}

export function OtherFundTab({ month, year, onDataUpdate }: OtherFundTabProps) {
    const [funds, setFunds] = useState<OtherFundData[]>([])
    const [loading, setLoading] = useState(true)

    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [month, year])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetchWithAuth(`${API_URL}/api/other-fund?month=${month}&year=${year}`)
            if (res.ok) {
                const json = await res.json()
                setFunds(json)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !amount) return
        setIsSubmitting(true)

        try {
            const res = await fetchWithAuth(`${API_URL}/api/other-fund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month,
                    year,
                    name,
                    amount: parseFloat(amount) || 0
                })
            })
            if (res.ok) {
                setName('')
                setAmount('')
                fetchData()
                onDataUpdate()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/api/other-fund/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchData()
                onDataUpdate()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const totalFund = funds.reduce((sum, f) => sum + f.amount, 0)

    if (loading) return <div className="text-slate-400 py-8 text-center animate-pulse">Memuat data dana lainnya...</div>

    return (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 bg-slate-900/30 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Dana Lainnya</h2>
                    <p className="text-sm text-slate-400">Daftar pendapatan / dana di luar gaji pada bulan ini.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Total Dana Lainnya Bulan Ini</p>
                    <p className="text-2xl font-bold text-amber-400">Rp {totalFund.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="p-6">
                <form onSubmit={handleAdd} className="flex gap-3 mb-8">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama Dana (misal: Bonus, Hadiah)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                        />
                    </div>
                    <div className="w-1/3">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nominal"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-500 text-white h-[46px] px-6 cursor-pointer">
                        {isSubmitting ? 'Menyimpan...' : 'Tambah'}
                    </Button>
                </form>

                {funds.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-700/60 rounded-xl bg-slate-800/30">
                        <p className="text-slate-400">Belum ada data dana lainnya di bulan ini.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {funds.map((fund) => (
                            <div key={fund.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700/40 bg-slate-800/60 hover:bg-slate-700/40 transition-colors">
                                <div>
                                    <h3 className="text-slate-200 font-medium">{fund.name}</h3>
                                    <p className="text-xs text-slate-500">{new Date(fund.createdAt).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-amber-400 font-semibold">+ Rp {fund.amount.toLocaleString('id-ID')}</span>
                                    <button onClick={() => handleDelete(fund.id)} className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer" title="Hapus">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
