'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function BookingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Daftar layanan individu
  const individualServices = [
    { id: 'cuci_std', name: 'Cuci AC 0.5 – 2 PK', price: 90000, category: 'Cuci AC' },
    { id: 'cuci_inv', name: 'Cuci AC Inverter 0.5 – 2 PK', price: 140000, category: 'Cuci AC' },
    { id: 'isi_freon_r22_1', name: 'Isi Freon R22 0.5 – 1 PK', price: 275000, category: 'Freon' },
    { id: 'isi_freon_r22_2', name: 'Isi Freon R22 1.5 – 2 PK', price: 325000, category: 'Freon' },
    { id: 'isi_freon_r32_1', name: 'Isi Freon R32/R410 0.5 – 1 PK', price: 350000, category: 'Freon' },
    { id: 'isi_freon_r32_2', name: 'Isi Freon R32/R410 1.5 – 2 PK', price: 450000, category: 'Freon' },
    { id: 'bongkar', name: 'Bongkar AC', price: 175000, category: 'Bongkar Pasang' },
    { id: 'pasang_1', name: 'Pasang AC 0.5 – 1 PK', price: 300000, category: 'Bongkar Pasang' },
    { id: 'pasang_2', name: 'Pasang AC 1.5 – 2 PK', price: 375000, category: 'Bongkar Pasang' },
    { id: 'vacuum', name: 'Vacuum', price: 150000, category: 'Perawatan' },
    { id: 'cek', name: 'Pengecekan AC', price: 75000, category: 'Pengecekan' },
  ];

  // Daftar PAKET layanan (lebih hemat)
  const packages = [
    { 
      id: 'paket_cuci_freon_r22', 
      name: '📦 Paket Cuci AC + Isi Freon R22', 
      description: 'Cuci AC + Isi Freon R22 (0.5-1 PK)',
      included: ['Cuci AC 0.5-2 PK', 'Isi Freon R22 0.5-1 PK'],
      price: 335000, 
      originalPrice: 275000 + 90000,
      save: 30000,
      popular: true
    },
    { 
      id: 'paket_cuci_freon_r32', 
      name: '📦 Paket Cuci AC + Isi Freon R32', 
      description: 'Cuci AC + Isi Freon R32/R410 (0.5-1 PK)',
      included: ['Cuci AC 0.5-2 PK', 'Isi Freon R32/R410 0.5-1 PK'],
      price: 390000, 
      originalPrice: 350000 + 90000,
      save: 50000,
      popular: true
    },
    { 
      id: 'paket_service_lengkap', 
      name: '📦 Paket Service Lengkap', 
      description: 'Cuci AC + Isi Freon R22 + Pengecekan',
      included: ['Cuci AC 0.5-2 PK', 'Isi Freon R22 0.5-1 PK', 'Pengecekan AC'],
      price: 410000, 
      originalPrice: 275000 + 90000 + 75000,
      save: 30000,
      popular: false
    },
    { 
      id: 'paket_bongkar_pasang', 
      name: '📦 Paket Bongkar Pasang AC', 
      description: 'Bongkar + Pasang AC (0.5-1 PK)',
      included: ['Bongkar AC', 'Pasang AC 0.5-1 PK'],
      price: 425000, 
      originalPrice: 175000 + 300000,
      save: 50000,
      popular: false
    },
    { 
      id: 'paket_perawatan', 
      name: '📦 Paket Perawatan Rutin', 
      description: 'Cuci AC + Vacuum + Pengecekan',
      included: ['Cuci AC 0.5-2 PK', 'Vacuum', 'Pengecekan AC'],
      price: 290000, 
      originalPrice: 90000 + 150000 + 75000,
      save: 25000,
      popular: false
    },
  ];

  const [bookingType, setBookingType] = useState<'single' | 'package'>('single');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    ac_type: 'split',
    unit_count: 1,
    phone: '',
    address: '',
    schedule_date: '',
    schedule_time: '',
    notes: '',
    is_apartment: false,
  });

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    }
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const getTotalPrice = () => {
    let basePrice = 0;
    if (bookingType === 'single' && selectedService) {
      basePrice = selectedService.price * formData.unit_count;
    } else if (bookingType === 'package' && selectedPackage) {
      basePrice = selectedPackage.price * formData.unit_count;
    }
    if (formData.is_apartment) {
      basePrice += 20000;
    }
    return basePrice;
  };

  const getServiceName = () => {
    if (bookingType === 'single' && selectedService) {
      return selectedService.name;
    } else if (bookingType === 'package' && selectedPackage) {
      return selectedPackage.name;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if ((bookingType === 'single' && !selectedService) || (bookingType === 'package' && !selectedPackage)) {
      setError('Pilih layanan atau paket terlebih dahulu');
      setLoading(false);
      return;
    }

    if (!formData.phone) {
      setError('Nomor telepon harus diisi');
      setLoading(false);
      return;
    }

    if (!formData.address) {
      setError('Alamat harus diisi');
      setLoading(false);
      return;
    }

    if (!formData.schedule_date) {
      setError('Tanggal booking harus diisi');
      setLoading(false);
      return;
    }

    const totalPrice = getTotalPrice();

    const { error: insertError } = await supabase
      .from('bookings')
      .insert({
        user_id: user?.id,
        service_type: getServiceName(),
        ac_type: formData.ac_type,
        unit_count: formData.unit_count,
        phone: formData.phone,
        address: formData.address,
        schedule_date: formData.schedule_date,
        schedule_time: formData.schedule_time || '08:00',
        notes: formData.notes,
        status: 'pending',
        total_price: totalPrice,
      });

    if (insertError) {
      setError('Gagal menyimpan booking: ' + insertError.message);
    } else {
      setSuccess('Booking berhasil! Mengarahkan ke dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Navbar />

      <div className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#0A2540]">Booking Service AC</h1>
            <p className="text-gray-500 mt-2">Pilih layanan atau paket hemat untuk AC Anda</p>
          </div>

          {/* Pilihan Tipe Booking */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setBookingType('single')}
              className={`px-6 py-3 rounded-2xl font-semibold transition ${
                bookingType === 'single' 
                  ? 'bg-[#00A6C4] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔧 Layanan Biasa
            </button>
            <button
              onClick={() => setBookingType('package')}
              className={`px-6 py-3 rounded-2xl font-semibold transition ${
                bookingType === 'package' 
                  ? 'bg-[#00A6C4] text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              📦 Paket Hemat (Lebih Murah!)
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Booking */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 text-red-700 p-4 rounded-2xl">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 text-green-700 p-4 rounded-2xl">
                    {success}
                  </div>
                )}

                {/* Pilih Layanan / Paket */}
                {bookingType === 'single' ? (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Pilih Layanan *</label>
                    <select
                      onChange={(e) => {
                        const service = individualServices.find(s => s.id === e.target.value);
                        setSelectedService(service || null);
                      }}
                      className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
                      required
                    >
                      <option value="">-- Pilih Layanan --</option>
                      <optgroup label="🧼 Cuci AC">
                        {individualServices.filter(s => s.category === 'Cuci AC').map(s => (
                          <option key={s.id} value={s.id}>{s.name} - Rp{s.price.toLocaleString()}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🧊 Freon">
                        {individualServices.filter(s => s.category === 'Freon').map(s => (
                          <option key={s.id} value={s.id}>{s.name} - Rp{s.price.toLocaleString()}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🔧 Bongkar Pasang">
                        {individualServices.filter(s => s.category === 'Bongkar Pasang').map(s => (
                          <option key={s.id} value={s.id}>{s.name} - Rp{s.price.toLocaleString()}</option>
                        ))}
                      </optgroup>
                      <optgroup label="📋 Lainnya">
                        {individualServices.filter(s => s.category === 'Perawatan' || s.category === 'Pengecekan').map(s => (
                          <option key={s.id} value={s.id}>{s.name} - Rp{s.price.toLocaleString()}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Pilih Paket Hemat *</label>
                    <div className="space-y-3">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`border-2 rounded-2xl p-4 cursor-pointer transition ${
                            selectedPackage?.id === pkg.id 
                              ? 'border-[#00A6C4] bg-cyan-50' 
                              : 'border-gray-200 hover:border-cyan-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg">{pkg.name}</h3>
                                {pkg.popular && (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                    Paling Laris
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                              <div className="flex gap-2 mt-2 text-xs text-gray-400">
                                {pkg.included.map((item, idx) => (
                                  <span key={idx} className="bg-gray-100 px-2 py-1 rounded">✓ {item}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-xl text-[#00A6C4]">Rp{pkg.price.toLocaleString()}</div>
                              <div className="text-xs text-gray-400 line-through">Rp{pkg.originalPrice.toLocaleString()}</div>
                              <div className="text-xs text-green-600">Hemat Rp{pkg.save.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tipe AC & Jumlah Unit */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tipe AC</label>
                    <select
                      name="ac_type"
                      value={formData.ac_type}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
                    >
                      <option value="split">❄️ AC Split</option>
                      <option value="central">🏢 AC Central</option>
                      <option value="vrv">🏭 AC VRV/VRF</option>
                      <option value="window">🪟 AC Window</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Jumlah Unit</label>
                    <input
                      type="number"
                      name="unit_count"
                      value={formData.unit_count}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Lokasi Apartemen */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_apartment"
                    checked={formData.is_apartment}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <label className="text-sm font-semibold">
                    Lokasi Apartemen (+Rp20.000)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nomor Telepon *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
                    placeholder="0812-3456-7890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Alamat Lengkap *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50 h-28"
                    placeholder="Jl. Contoh No. 123, Jakarta"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tanggal Booking *</label>
                    <input
                      type="date"
                      name="schedule_date"
                      value={formData.schedule_date}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Jam Booking</label>
                    <input
                      type="time"
                      name="schedule_time"
                      value={formData.schedule_time}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
                    />
                    <p className="text-xs text-gray-400 mt-1">Kosongkan jika fleksibel</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Catatan</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50 h-24"
                    placeholder="Contoh: AC tidak dingin, suara berisik, dll"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00A6C4] hover:bg-cyan-500 text-white py-4 rounded-2xl font-bold text-lg transition disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Booking Sekarang'}
                </button>
              </form>
            </div>

            {/* Ringkasan Order */}
            <div className="bg-[#0A2540] text-white rounded-3xl p-8 shadow-xl h-fit sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Ringkasan Order</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span>{bookingType === 'single' ? 'Layanan' : 'Paket'}</span>
                  <span className="font-semibold text-right">{getServiceName() || 'Belum dipilih'}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span>Tipe AC</span>
                  <span>
                    {formData.ac_type === 'split' && 'AC Split'}
                    {formData.ac_type === 'central' && 'AC Central'}
                    {formData.ac_type === 'vrv' && 'AC VRV/VRF'}
                    {formData.ac_type === 'window' && 'AC Window'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span>Jumlah Unit</span>
                  <span>{formData.unit_count} unit</span>
                </div>
                {bookingType === 'single' && selectedService && (
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span>Harga per Unit</span>
                    <span>Rp{selectedService.price.toLocaleString()}</span>
                  </div>
                )}
                {formData.is_apartment && (
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span>Biaya Apartemen</span>
                    <span>Rp20.000</span>
                  </div>
                )}
              </div>
              <div className="mt-6 bg-white/10 rounded-2xl p-5">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-2xl text-[#00A6C4]">
                    Rp{getTotalPrice().toLocaleString()}
                  </span>
                </div>
                {bookingType === 'package' && selectedPackage && (
                  <p className="text-xs text-green-300 mt-2 text-center">
                    Hemat Rp{selectedPackage.save.toLocaleString()} dari harga normal!
                  </p>
                )}
              </div>
              <div className="mt-6 text-center text-xs text-white/50 space-y-1">
                <p>✓ Booking gratis</p>
                <p>✓ Teknisi akan menghubungi Anda</p>
                <p>✓ Pembayaran di tempat</p>
                <p>✓ Garansi 7-30 hari</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}