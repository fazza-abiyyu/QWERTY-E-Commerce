'use client';
import { useState, useEffect } from 'react';
import { Mail, RefreshCw, Trash2, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sent_at: string;
}

export default function EmailerSimulatorPage() {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulators/emailer');
      const data = await res.json();
      if (data.success) {
        setEmails(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear email history?')) return;
    try {
      await fetch('/api/simulators/emailer', { method: 'DELETE' });
      setEmails([]);
    } catch (error) {
      console.error('Failed to clear history');
    }
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#111] font-sans">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase">Email Simulator</h1>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Mock SMTP Service</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchEmails}
              className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={clearHistory}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {emails.length === 0 && !loading ? (
          <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-3xl">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Inbox is empty</h3>
            <p className="text-[12px] text-gray-400 mt-1">Try to request a forgot password OTP to see it here.</p>
          </div>
        ) : (
          <div data-testid="email-inbox" className="space-y-4">
            {emails.map((email) => (
              <div key={email.id} data-testid={`email-item-${email.id}`} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-[12px] font-bold">
                      {email.to.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span data-testid={`email-to-${email.id}`} className="text-sm font-black tracking-tight">{email.to}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded-md uppercase text-gray-500">To</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(email.sent_at).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 data-testid={`email-subject-${email.id}`} className="text-[13px] font-black text-gray-900 mb-2">{email.subject}</h4>
                  <p data-testid={`email-body-${email.id}`} className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                    {email.body.split(/(\d{6})/).map((part, i) => 
                      /^\d{6}$/.test(part) ? (
                        <span key={i} id="otp-code" data-testid="otp-code" className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          {part}
                        </span>
                      ) : part
                    )}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 w-1 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Delivered via QWERTY SMTP Simulation</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
