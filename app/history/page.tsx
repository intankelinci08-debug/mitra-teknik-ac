'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUserAndBookings() {
      // Cek user login
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Ambil semua booking user
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setBookings(bookingsData || []);
      setLoading(false);
    }
    getUserAndBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: 'Menunggu Konfirmasi',
      confirmed: 'Dikonfirmasi',
      in_progress: 'Sedang Dikerjakan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return textMap[status] || status;
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getServiceIcon = (serviceType: string) => {
    if (serviceType?.includes('Cuci')) return '🧼';
    if (serviceType?.includes('Freon')) return '🧊';
    if (serviceType?.includes('Perbaikan')) return '🔧';
    if (serviceType?.includes('Instalasi')) return '🏠';
    return '❄️';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0A2540]">Riwayat Service</h1>
          <p className="text-gray-500 mt-2">Semua riwayat pemesanan service AC Anda</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'all' 
                ? 'bg-[#0A2540] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Semua ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Menunggu ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'in_progress' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Diproses ({bookings.filter(b => b.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'completed' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Selesai ({bookings.filter(b => b.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              filter === 'cancelled' 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dibatalkan ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Daftar Booking */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 mb-4">Tidak ada riwayat service</p>
            <Link href="/booking">
              <button className="bg-[#00A6C4] hover:bg-cyan-500 text-white px-6 py-2 rounded-xl transition">
                Booking Sekarang
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Kiri: Info Service */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-3xl">{getServiceIcon(booking.service_type)}</span>
                      <h3 className="font-bold text-xl">{booking.service_type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <span className="text-sm text-gray-400">
                        ID: #{booking.id?.slice(0, 8)}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        📅 {booking.schedule_date || 'Belum dijadwalkan'}
                      </div>
                      <div className="flex items-center gap-1">
                        ⏰ {booking.schedule_time || 'Fleksibel'}
                      </div>
                      <div className="flex items-center gap-1">
                        📞 {booking.phone || '-'}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-[#0A2540]">
                        💰 Rp{(booking.total_price || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-400">
                      📍 {booking.address}
                    </div>
                    
                    {booking.notes && (
                      <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                        📝 Catatan: {booking.notes}
                      </div>
                    )}
                  </div>

{/* Kanan: Tombol Aksi */}
<div className="flex gap-2">
  <Link href={`/tracking/${booking.id}`}>
    <button className="border border-cyan-500 text-cyan-600 px-4 py-2 rounded-xl text-sm hover:bg-cyan-50 transition">
      Lacak
    </button>
  </Link>
  
  {booking.status === 'completed' && (
    <Link href={`/invoice/${booking.id}`}>
      <button className="border border-green-500 text-green-600 px-4 py-2 rounded-xl text-sm hover:bg-green-50 transition">
        📄 Invoice
      </button>
    </Link>
  )}
  
  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
    <button
      onClick={async () => {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', booking.id);
        if (!error) {
          setBookings(bookings.map(b => 
            b.id === booking.id ? { ...b, status: 'cancelled' } : b
          ));
        }
      }}
      className="border border-red-500 text-red-600 px-4 py-2 rounded-xl text-sm hover:bg-red-50 transition"
    >
      Batalkan
    </button>
  )}
  
  <Link href="/booking">
    <button className="bg-[#00A6C4] text-white px-4 py-2 rounded-xl text-sm hover:bg-cyan-500 transition">
      Booking Lagi
    </button>
  </Link>
</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ringkasan Statistik */}
        {bookings.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-3">📊 Ringkasan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#0A2540]">{bookings.length}</p>
                <p className="text-xs text-gray-500">Total Booking</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
                <p className="text-xs text-gray-500">Menunggu</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{bookings.filter(b => b.status === 'in_progress').length}</p>
                <p className="text-xs text-gray-500">Diproses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'completed').length}</p>
                <p className="text-xs text-gray-500">Selesai</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}