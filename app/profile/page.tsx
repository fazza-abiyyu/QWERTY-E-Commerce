'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../src/store/auth.store';
import { User, Save, Check, Loader2, Mail, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [detail, setDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user?.full_name) setFullName(user.full_name);
    if (user?.address) {
      setProvince(user.address.province || '');
      setCity(user.address.city || '');
      setDistrict(user.address.district || '');
      setDetail(user.address.detail || '');
    }
  }, [user]);

  if (!mounted) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const currentAddress = user.address || { province: '', city: '', district: '', detail: '' };
  const hasChanges = 
    fullName !== (user.full_name || '') ||
    province !== (currentAddress.province || '') ||
    city !== (currentAddress.city || '') ||
    district !== (currentAddress.district || '') ||
    detail !== (currentAddress.detail || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          address: {
            province: province.trim(),
            city: city.trim(),
            district: district.trim(),
            detail: detail.trim(),
          }
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSaved(true);
        await checkAuth();
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[#111] mb-2">Profile Settings</h1>
      <p className="text-[14px] text-gray-400 mb-10">Manage your personal information.</p>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User className="w-8 h-8" />}
          </div>
          <div>
            <p className="text-[16px] font-bold text-gray-900">{fullName || 'Your Name'}</p>
            <p className="text-[13px] text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              data-testid="profile-name-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full pl-11 pr-4 py-3.5 bg-[#f7f7f7] rounded-xl text-[14px] text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-all"
            />
          </div>
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              data-testid="profile-email-input"
              value={user.email}
              disabled
              className="w-full pl-11 pr-4 py-3.5 bg-[#f7f7f7] rounded-xl text-[14px] text-gray-400 cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Email cannot be changed.</p>
        </div>

        {/* Shipping Address */}
        <div>
          <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider block mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Shipping Address
          </label>
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium text-gray-500 block mb-1.5">Province</label>
              <input
                type="text"
                data-testid="profile-province-input"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="e.g. Jawa Barat"
                className="w-full px-4 py-3 bg-[#f7f7f7] rounded-xl text-[14px] text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-gray-500 block mb-1.5">City / Kabupaten</label>
                <input
                  type="text"
                  data-testid="profile-city-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bandung"
                  className="w-full px-4 py-3 bg-[#f7f7f7] rounded-xl text-[14px] text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-500 block mb-1.5">Kecamatan / Desa</label>
                <input
                  type="text"
                  data-testid="profile-district-input"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Coblong"
                  className="w-full px-4 py-3 bg-[#f7f7f7] rounded-xl text-[14px] text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-500 block mb-1.5">Detail Alamat</label>
              <textarea
                data-testid="profile-detail-input"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                rows={3}
                className="w-full px-4 py-3 bg-[#f7f7f7] rounded-xl text-[14px] text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111]/10 transition-all resize-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 ml-1">This will be your default shipping address during checkout.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-[13px] font-medium rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-3 bg-green-50 text-green-700 text-[13px] font-medium rounded-xl border border-green-100 flex items-center gap-2">
            <Check className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !hasChanges}
          data-testid="profile-save-button"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#111] text-white text-[13px] font-bold rounded-full hover:bg-[#333] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
