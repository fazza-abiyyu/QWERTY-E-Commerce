'use client';
import { useState } from 'react';
import { Building2, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AtmSimulator() {
  const [vaNumber, setVaNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const lookupVA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaNumber) return;
    
    setLoading(true);
    setError('');
    setOrderData(null);
    setPaymentStatus('idle');

    try {
      const res = await fetch(`/api/orders/by-code/${vaNumber}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrderData(data.data);
      } else {
        setError('Virtual Account number not found. Please check your input.');
      }
    } catch (e) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!orderData) return;
    setPaymentStatus('processing');

    const payload = {
      order_id: orderData.id,
      transaction_status: 'settlement',
      fraud_status: 'accept',
      payment_type: orderData.payment_method || 'bank_transfer',
      status_code: '200'
    };

    try {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await fetch('/api/webhooks/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setPaymentStatus('success');
      } else {
        setError('Failed to process payment with the bank.');
        setPaymentStatus('idle');
      }
    } catch (error) {
      setError('Network error occurred during payment.');
      setPaymentStatus('idle');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">QWERTY Bank ATM</h1>
        <p className="text-[14px] text-gray-500">
          Mobile Banking Simulator. Masukkan Nomor Virtual Account Anda untuk membayar pesanan.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
        {paymentStatus === 'success' ? (
          <div className="p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Transfer Berhasil!</h2>
            <p className="text-[14px] text-gray-500 mb-6">
              Dana sebesar Rp {orderData.total_amount.toLocaleString('id-ID')} telah dikirim ke QWERTY Store.
            </p>
            <button 
              onClick={() => {
                setPaymentStatus('idle');
                setOrderData(null);
                setVaNumber('');
              }}
              className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        ) : !orderData ? (
          <div className="p-8">
            <form onSubmit={lookupVA}>
              <label className="text-[13px] font-bold text-gray-700 block mb-2 uppercase tracking-wide">Nomor Virtual Account</label>
              <input 
                type="text" 
                required
                value={vaNumber}
                onChange={(e) => setVaNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 8077123456"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[16px] font-mono tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all mb-6"
                data-testid="va-input"
              />
              
              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] font-medium rounded-xl border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}

              <button 
                type="submit" 
                disabled={loading || !vaNumber}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white text-[15px] font-bold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Cek Tagihan
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 animate-in slide-in-from-right-4 duration-300">
            <button onClick={() => setOrderData(null)} className="text-[13px] font-bold text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1">
              &larr; Kembali
            </button>
            
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Konfirmasi Pembayaran</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 border-dashed">
                  <span className="text-[13px] text-gray-500 font-medium">Penyedia</span>
                  <span className="text-[14px] font-bold text-gray-900">QWERTY Store</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 border-dashed">
                  <span className="text-[13px] text-gray-500 font-medium">No. VA</span>
                  <span id="payment-va-number" className="text-[14px] font-mono font-bold text-gray-900" data-testid="payment-va-number">{orderData.payment_code}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[13px] text-gray-500 font-medium">Total Tagihan</span>
                  <span className="text-[18px] font-black text-blue-600">Rp {orderData.total_amount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={processPayment}
              disabled={paymentStatus === 'processing'}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white text-[15px] font-bold rounded-xl hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              {paymentStatus === 'processing' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
              ) : (
                'Bayar Tagihan'
              )}
            </button>
          </div>
        )}
      </div>
      <p className="text-center text-[12px] font-medium text-gray-400 mt-8">
        Sistem simulasi otomatis akan mengirimkan Webhook ke server QWERTY setelah pembayaran berhasil.
      </p>
    </div>
  );
}
