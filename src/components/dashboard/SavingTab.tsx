import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/lib/api'

type SavingData = {
    id: string
    instrument: string
    amount: number
    createdAt: string
}

interface SavingTabProps {
    month: number
    year: number
    onDataUpdate: () => void
}

export function SavingTab({ month, year, onDataUpdate }: SavingTabProps) {
    const [savings, setSavings] = useState<SavingData[]>([])
    const [loading, setLoading] = useState(true)

    const [instrument, setInstrument] = useState('')
    const [amount, setAmount] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [month, year])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/api/saving?month=${month}&year=${year}`, { credentials: 'include' })
            if (res.ok) {
                const json = await res.json()
                setSavings(json)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!instrument || !amount) return
        setIsSubmitting(true)

        try {
            const res = await fetch(`${API_URL}/api/saving`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    month,
                    year,
                    instrument,
                    amount: parseFloat(amount) || 0
                })
            })
            if (res.ok) {
                setInstrument('')
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
            const res = await fetch(`${API_URL}/api/saving/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (res.ok) {
                fetchData()
                onDataUpdate()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const totalSaving = savings.reduce((sum, sav) => sum + sav.amount, 0)

    if (loading) return <div className="text-slate-400 py-8 text-center animate-pulse">Memuat data tabungan...</div>

    return (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 bg-slate-900/30 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-white">Instrumen Tabungan</h2>
                    <p className="text-sm text-slate-400">Daftar tabungan atau investasi pada bulan ini.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Total Tabungan Bulan Ini</p>
                    <p className="text-2xl font-bold text-emerald-400">Rp {totalSaving.toLocaleString('id-ID')}</p>
                </div>
            </div>

            <div className="p-6">
                <form onSubmit={handleAdd} className="flex gap-3 mb-8">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={instrument}
                            onChange={(e) => setInstrument(e.target.value)}
                            placeholder="Nama Instrumen (misal: Reksadana, Emas)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                    </div>
                    <div className="w-1/3">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nominal"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white h-[46px] px-6 cursor-pointer">
                        {isSubmitting ? 'Menyimpan...' : 'Tambah'}
                    </Button>
                </form>

                {savings.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-700/60 rounded-xl bg-slate-800/30">
                        <p className="text-slate-400">Belum ada data tabungan di bulan ini.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {savings.map((saving) => (
                            <div key={saving.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700/40 bg-slate-800/60 hover:bg-slate-700/40 transition-colors">
                                <div>
                                    <h3 className="text-slate-200 font-medium">{saving.instrument}</h3>
                                    <p className="text-xs text-slate-500">{new Date(saving.createdAt).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-400 font-semibold">+ Rp {saving.amount.toLocaleString('id-ID')}</span>
                                    <button onClick={() => handleDelete(saving.id)} className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer" title="Hapus">
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
