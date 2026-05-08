'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, X, Loader2, ShieldCheck, CreditCard, Wallet, Building2, ChevronRight, Copy } from 'lucide-react';

function MidtransSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const order_id = searchParams.get('order_id');
  const [loading, setLoading] = useState(false);
  const [orderAmount, setOrderAmount] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchOrder = async () => {
    if (!order_id) return;
    try {
      const res = await fetch(`/api/orders/${order_id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrderAmount(data.data.total_amount);
        setOrderStatus(data.data.status);
        if (data.data.payment_code) {
          setPaymentCode(data.data.payment_code);
          if (data.data.payment_method) {
            setSelectedMethod(data.data.payment_method);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll for status updates every 5 seconds if waiting for payment
    const interval = setInterval(() => {
      if (paymentCode && orderStatus === 'pending') {
        fetchOrder();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [order_id, paymentCode, orderStatus]);

  // If order becomes paid via the webhook simulator, automatically redirect
  useEffect(() => {
    if (orderStatus === 'paid' && paymentCode) {
      setTimeout(() => {
        router.push(`/orders/${order_id}`);
      }, 2000);
    }
  }, [orderStatus, paymentCode, router, order_id]);

  const generatePaymentCode = async () => {
    setLoading(true);
    // Simulate API delay
    const prefix = selectedMethod === 'bca_va' ? '8077' : selectedMethod === 'mandiri_va' ? '89508' : '7001';
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const code = `${prefix}${randomDigits}`;
    
    // Persist to backend JSON
    if (order_id && selectedMethod) {
      try {
        await fetch(`/api/orders/${order_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_payment_code', payment_method: selectedMethod, payment_code: code })
        });
      } catch (e) {
        console.error(e);
      }
    }
    
    setPaymentCode(code);
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (paymentCode) {
      navigator.clipboard.writeText(paymentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order_id) return <div className="text-center py-32"><p className="text-[15px] font-medium text-[#111]">Invalid session</p><p className="text-[14px] text-gray-400">No order ID found.</p></div>;

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#f8f9fa] px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-gray-900">QWERTY Store</h1>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Order ID: {order_id}</p>
          </div>
          <ShieldCheck className="w-8 h-8 text-blue-500" />
        </div>
        
        {orderStatus === 'paid' && paymentCode ? (
          <div className="py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-[20px] font-black text-gray-900">Payment Successful!</p>
            <p className="text-[14px] text-gray-500 mt-2">Returning to merchant...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <p className="text-[13px] font-medium text-gray-500 mb-1">Total Amount</p>
              <p className="text-2xl font-black text-gray-900">
                {orderAmount !== null ? `Rp ${orderAmount.toLocaleString('id-ID')}` : 'Loading...'}
              </p>
            </div>

            {!selectedMethod ? (
              <>
                <p className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-3">Select Payment Method</p>
                <div className="space-y-2">
                  {[
                    { id: 'bca_va', name: 'BCA Virtual Account', icon: Building2 },
                    { id: 'mandiri_va', name: 'Mandiri Virtual Account', icon: Building2 },
                    { id: 'gopay', name: 'GoPay', icon: Wallet },
                  ].map(method => (
                    <button 
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                          <method.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-[14px] font-semibold text-gray-900">{method.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button onClick={() => router.push('/orders')} className="w-full py-3 text-gray-500 text-[13px] font-semibold hover:text-red-500 transition-colors">
                    Cancel & Return to Merchant
                  </button>
                </div>
              </>
            ) : !paymentCode ? (
              <div className="animate-in slide-in-from-right-4 duration-200">
                <button onClick={() => setSelectedMethod(null)} className="text-[13px] font-medium text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-1">
                  &larr; Back to methods
                </button>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
                  <p className="text-[14px] text-gray-900 mb-1 font-semibold">You selected {selectedMethod.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-[13px] text-gray-500">Generate a payment code to complete your transaction.</p>
                </div>

                <button onClick={generatePaymentCode} disabled={loading} className="w-full flex items-center justify-center py-4 bg-blue-600 text-white text-[15px] font-bold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md active:scale-95">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Payment Code'}
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 text-center">
                  <p className="text-[12px] font-bold text-blue-800 uppercase tracking-wider mb-2">Virtual Account Number</p>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <p className="text-3xl font-black text-gray-900 font-mono tracking-tight" data-testid="payment-va-number">{paymentCode}</p>
                  </div>
                  <button onClick={copyToClipboard} className="text-[12px] font-semibold text-blue-700 flex items-center justify-center gap-1 mx-auto hover:text-blue-800 transition-colors bg-white/60 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} 
                    {copied ? 'Copied to clipboard!' : 'Copy Code'}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-4 border-t border-gray-100">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-3" />
                  <p className="text-[14px] font-bold text-gray-900">Waiting for payment...</p>
                  <p className="text-[12px] text-gray-500 mt-1 text-center">
                    Please transfer the exact amount to the virtual account number above.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => router.push(`/orders/${order_id}`)} className="w-full py-3 text-gray-500 text-[13px] font-semibold hover:text-gray-900 transition-colors">
                    Close and wait for confirmation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-center text-[12px] font-medium text-gray-400 mt-6 flex items-center justify-center gap-1">
        Secured by <ShieldCheck className="w-4 h-4" /> QWERTY Mock Gateway
      </p>
    </div>
  );
}

export default function MidtransSimulatorPage() {
  return <Suspense fallback={<div className="text-center py-32 text-gray-400 text-[14px] font-medium">Loading secure payment gateway...</div>}><MidtransSimulatorContent /></Suspense>;
}
