'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Ambil data booking user
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
      </div>
    );
  }

  // Statistik sederhana
  const activeBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#0A2540] to-[#1a4a6e] text-white rounded-3xl p-8 shadow-xl mt-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-cyan-200 mt-2">Selamat datang kembali, {user?.email?.split('@')[0]}!</p>
            </div>
            <Link href="/booking">
              <button className="bg-[#00A6C4] hover:bg-cyan-500 px-6 py-3 rounded-2xl font-semibold transition shadow-lg">
                + Booking Baru
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
              <div>
                <p className="text-gray-500 text-sm">Total Booking</p>
                <p className="text-2xl font-bold text-[#0A2540]">{bookings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">🔄</div>
              <div>
                <p className="text-gray-500 text-sm">Booking Aktif</p>
                <p className="text-2xl font-bold text-[#0A2540]">{activeBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">💰</div>
              <div>
                <p className="text-gray-500 text-sm">Total Belanja</p>
                <p className="text-2xl font-bold text-[#0A2540]">Rp{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

{/* Recent Bookings */}
<div className="mt-8">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-[#0A2540]">📋 Booking Terbaru</h2>
    <Link href="/history" className="text-[#00A6C4] hover:underline text-sm">
      Lihat Semua →
    </Link>
  </div>

  {bookings.length === 0 ? (
    <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
      <div className="text-6xl mb-4">📭</div>
      <p className="text-gray-500 mb-4">Belum ada booking</p>
      <Link href="/booking">
        <button className="bg-[#00A6C4] hover:bg-cyan-500 text-white px-6 py-2 rounded-xl transition">
          Booking Sekarang
        </button>
      </Link>
    </div>
  ) : (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {booking.service_type?.includes('Cuci') && '🧼'}
                  {booking.service_type?.includes('Freon') && '🧊'}
                  {booking.service_type?.includes('Perbaikan') && '🔧'}
                  {booking.service_type?.includes('Instalasi') && '🏠'}
                </span>
                <h3 className="font-bold text-lg">{booking.service_type}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">📅 {booking.schedule_date || 'Belum dijadwalkan'}</div>
                <div className="flex items-center gap-1">📍 {booking.address?.substring(0, 30)}...</div>
                <div className="flex items-center gap-1">💰 Rp{(booking.total_price || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Tombol LACAK - ini yang ditambahkan */}
              <Link href={`/tracking/${booking.id}`}>
                <button className="border border-cyan-500 text-cyan-600 px-4 py-2 rounded-xl text-sm hover:bg-cyan-50 transition">
                  Lacak
                </button>
              </Link>
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
</div>

        {/* Quick Action */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">⚡ Layanan Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/booking">
              <button className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl text-center transition">🧼 Cuci AC</button>
            </Link>
            <Link href="/booking">
              <button className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl text-center transition">🧊 Isi Freon</button>
            </Link>
            <Link href="/booking">
              <button className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl text-center transition">🔧 Perbaikan</button>
            </Link>
            <Link href="/booking">
              <button className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl text-center transition">🏠 Instalasi</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}