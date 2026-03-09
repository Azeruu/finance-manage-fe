import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { API_URL, fetchWithAuth } from '@/lib/api'

interface RecentExpenseTabProps {
    onDataUpdate: () => void
}

export function RecentExpenseTab({ onDataUpdate }: RecentExpenseTabProps) {
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('Belanja')
    const [paymentMethod, setPaymentMethod] = useState('QRIS')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetchWithAuth(`${API_URL}/api/recent-expense`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    amount: parseFloat(amount.replace(/\./g, '')),
                    category,
                    paymentMethod,
                    date: new Date().toISOString()
                })
            })

            if (!res.ok) throw new Error('Failed to save expense')

            // Reset form
            setName('')
            setAmount('')
            alert('Pengeluaran berhasil disimpan!')
            // Trigger data refresh in parent
            onDataUpdate()
        } catch (error) {
            console.error('Failed to submit expense:', error)
            alert('Gagal menyimpan pengeluaran.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatNumberWithDots = (value: string) => {
        const numberValue = value.replace(/\D/g, '');
        return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    return (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Catat Pengeluaran Terkini</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nama Pengeluaran</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Kopi susu"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Jumlah (Rp)</label>
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(formatNumberWithDots(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: 25.000"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Kategori</label>
                    <div className="flex flex-wrap gap-2">
                        {['Belanja', 'Investasi', 'Transportasi', 'Makan', 'Hiburan', 'Lainnya'].map(cat => (
                            <Button
                                key={cat}
                                type="button"
                                variant={category === cat ? 'default' : 'outline'}
                                onClick={() => setCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Metode Pembayaran</label>
                    <div className="flex flex-wrap gap-2">
                        {['QRIS', 'GoPay', 'ShopeePay', 'OVO', 'Dana', 'Tunai'].map(method => (
                            <Button
                                key={method}
                                type="button"
                                variant={paymentMethod === method ? 'default' : 'outline'}
                                onClick={() => setPaymentMethod(method)}
                            >
                                {method}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
