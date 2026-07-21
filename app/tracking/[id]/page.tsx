'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TrackingPage() {
  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const supabase = createClient();

  const statusFlow = [
    { key: 'pending', label: 'Menunggu Konfirmasi', icon: '📋', description: 'Booking Anda sedang kami proses' },
    { key: 'confirmed', label: 'Dikonfirmasi', icon: '✅', description: 'Booking telah dikonfirmasi' },
    { key: 'in_progress', label: 'Sedang Dikerjakan', icon: '🔧', description: 'Teknisi sedang menuju lokasi' },
    { key: 'completed', label: 'Selesai', icon: '🎉', description: 'Service AC telah selesai' },
  ];

  const getCurrentStepIndex = (status: string) => {
    return statusFlow.findIndex(step => step.key === status);
  };

  const getServiceIcon = (serviceType: string) => {
    if (serviceType?.includes('Cuci')) return '🧼';
    if (serviceType?.includes('Freon')) return '🧊';
    if (serviceType?.includes('Perbaikan')) return '🔧';
    if (serviceType?.includes('Instalasi')) return '🏠';
    return '❄️';
  };

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error || !data) {
        setError('Booking tidak ditemukan');
      } else if (data.user_id !== user.id) {
        setError('Anda tidak memiliki akses ke booking ini');
      } else {
        setBooking(data);
      }
      setLoading(false);
    }
    getData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <Navbar />
        <div className="max-w-2xl mx-auto p-6 mt-10">
          <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Booking tidak ditemukan'}</h2>
            <Link href="/history">
              <button className="bg-[#00A6C4] text-white px-6 py-2 rounded-xl">
                Kembali ke Riwayat
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex(booking.status);
  const isCancelled = booking.status === 'cancelled';

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/history" className="text-[#00A6C4] hover:underline flex items-center gap-1">
            ← Kembali ke Riwayat
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header Booking */}
          <div className="bg-gradient-to-r from-[#0A2540] to-[#1a4a6e] text-white p-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getServiceIcon(booking.service_type)}</span>
                  <div>
                    <h1 className="text-2xl font-bold">{booking.service_type}</h1>
                    <p className="text-cyan-200 text-sm mt-1">
                      ID Booking: #{booking.id?.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-200">Total Pembayaran</p>
                <p className="text-2xl font-bold">Rp{(booking.total_price || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg mb-6">📊 Status Pemesanan</h2>
            
            {isCancelled ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">❌</div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Booking Dibatalkan</h3>
                <p className="text-gray-600">Booking ini telah dibatalkan.</p>
                <Link href="/booking">
                  <button className="mt-4 bg-[#00A6C4] text-white px-6 py-2 rounded-xl">
                    Booking Ulang
                  </button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 hidden md:block"></div>
                <div className="space-y-8">
                  {statusFlow.map((step, index) => {
                    const isActive = index <= currentStep;
                    const isCurrent = index === currentStep;
                    
                    return (
                      <div key={step.key} className="flex gap-4 md:gap-6">
                        <div className="relative z-10">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-xl
                            ${isActive 
                              ? 'bg-[#00A6C4] text-white shadow-lg' 
                              : 'bg-gray-200 text-gray-400'}
                            ${isCurrent ? 'ring-4 ring-cyan-200' : ''}
                          `}>
                            {isActive && !isCurrent ? '✓' : step.icon}
                          </div>
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className={`font-bold text-lg ${isActive ? 'text-[#0A2540]' : 'text-gray-400'}`}>
                              {step.label}
                            </h3>
                            {isCurrent && (
                              <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded-full">
                                Sedang Berlangsung
                              </span>
                            )}
                            {isActive && !isCurrent && index !== currentStep && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                Selesai
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {step.key === 'in_progress' && isActive && booking.schedule_date && (
                            <div className="mt-2 text-sm text-cyan-600 bg-cyan-50 inline-block px-3 py-1 rounded-full">
                              🗓️ Dijadwalkan: {booking.schedule_date} {booking.schedule_time ? `pukul ${booking.schedule_time}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Detail Booking */}
          <div className="p-6 bg-gray-50">
            <h3 className="font-bold text-lg mb-4">📋 Detail Booking</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Alamat</p>
                <p className="font-medium">{booking.address}</p>
              </div>
              <div>
                <p className="text-gray-500">Nomor Telepon</p>
                <p className="font-medium">{booking.phone || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal Booking</p>
                <p className="font-medium">{booking.schedule_date || 'Belum dijadwalkan'}</p>
              </div>
              <div>
                <p className="text-gray-500">Jam Booking</p>
                <p className="font-medium">{booking.schedule_time || 'Fleksibel'}</p>
              </div>
              <div>
                <p className="text-gray-500">Tipe AC</p>
                <p className="font-medium">{booking.ac_type || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Jumlah Unit</p>
                <p className="font-medium">{booking.unit_count || 1} unit</p>
              </div>
              <div>
                <p className="text-gray-500">👨‍🔧 Teknisi</p>
                <p className="font-medium">
                  {booking.teknisi_name ? (
                    <span className="text-green-600">{booking.teknisi_name}</span>
                  ) : (
                    <span className="text-yellow-600">Belum ditugaskan</span>
                  )}
                </p>
              </div>
              {booking.teknisi_name && (
                <div>
                  <p className="text-gray-500">📞 Kontak Teknisi</p>
                  <p className="font-medium">Akan dikonfirmasi via WhatsApp</p>
                </div>
              )}
            </div>
            
            {booking.notes && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                <p className="text-gray-500 text-sm">📝 Catatan</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Invoice Button - Hanya untuk booking selesai */}
          {booking.status === 'completed' && (
            <div className="p-6 bg-green-50 border-t border-green-100">
              <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <span>📄</span> Invoice
              </h4>
              <Link href={`/invoice/${booking.id}`}>
                <button className="bg-[#00A6C4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cyan-500 transition">
                  📄 Lihat & Download Invoice
                </button>
              </Link>
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="p-6 flex gap-3 flex-wrap">
            <Link href="/booking">
              <button className="bg-[#00A6C4] text-white px-6 py-2 rounded-xl hover:bg-cyan-500 transition">
                Booking Lagi
              </button>
            </Link>
            {!isCancelled && booking.status !== 'completed' && (
              <button
                onClick={async () => {
                  if (confirm('Yakin ingin membatalkan booking ini?')) {
                    const { error } = await supabase
                      .from('bookings')
                      .update({ status: 'cancelled' })
                      .eq('id', booking.id);
                    if (!error) {
                      window.location.reload();
                    }
                  }
                }}
                className="border border-red-500 text-red-600 px-6 py-2 rounded-xl hover:bg-red-50 transition"
              >
                Batalkan Booking
              </button>
            )}
            <Link href="/history">
              <button className="border border-gray-300 text-gray-600 px-6 py-2 rounded-xl hover:bg-gray-50 transition">
                Lihat Riwayat
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}