'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    inProgressBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Ambil semua booking
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      const pending = bookings?.filter(b => b.status === 'pending').length || 0;
      const inProgress = bookings?.filter(b => b.status === 'in_progress').length || 0;
      const completed = bookings?.filter(b => b.status === 'completed').length || 0;
      const cancelled = bookings?.filter(b => b.status === 'cancelled').length || 0;
      const revenue = bookings?.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
      
      // Customer unique
      const uniqueCustomers = new Set(bookings?.map(b => b.user_id)).size;
      
      // Pendapatan bulan ini
      const now = new Date();
      const monthlyRevenue = bookings?.filter(b => {
        const createdAt = new Date(b.created_at);
        return b.status === 'completed' && createdAt.getMonth() === now.getMonth();
      }).reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

      setStats({
        totalBookings: bookings?.length || 0,
        pendingBookings: pending,
        inProgressBookings: inProgress,
        completedBookings: completed,
        cancelledBookings: cancelled,
        totalRevenue: revenue,
        totalCustomers: uniqueCustomers,
        monthlyRevenue: monthlyRevenue,
      });
      
      setRecentBookings(bookings?.slice(0, 5) || []);
      setLoading(false);
    }
    loadData();
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
      pending: 'Menunggu',
      confirmed: 'Dikonfirmasi',
      in_progress: 'Diproses',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return textMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, Administrator</p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Booking</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pendapatan</p>
              <p className="text-3xl font-bold text-green-600">Rp{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Customer</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              👥
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pendapatan Bulan Ini</p>
              <p className="text-3xl font-bold text-[#00A6C4]">Rp{stats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-2xl">
              📅
            </div>
          </div>
        </div>
      </div>

      {/* Status Booking Chart */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">📊 Statistik Status Booking</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Menunggu Konfirmasi</span>
                <span className="font-semibold">{stats.pendingBookings}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Sedang Diproses</span>
                <span className="font-semibold">{stats.inProgressBookings}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats.totalBookings > 0 ? (stats.inProgressBookings / stats.totalBookings) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Selesai</span>
                <span className="font-semibold">{stats.completedBookings}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Dibatalkan</span>
                <span className="font-semibold">{stats.cancelledBookings}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats.totalBookings > 0 ? (stats.cancelledBookings / stats.totalBookings) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0A2540] to-[#1a4a6e] text-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">⚡ Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-white/20 hover:bg-white/30 rounded-xl p-3 transition text-left flex items-center gap-3">
              <span>➕</span> Tambah Booking Manual
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 rounded-xl p-3 transition text-left flex items-center gap-3">
              <span>🎫</span> Buat Voucher Diskon
            </button>
            <button className="w-full bg-white/20 hover:bg-white/30 rounded-xl p-3 transition text-left flex items-center gap-3">
              <span>📊</span> Export Laporan Bulanan
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg">📋 Booking Terbaru</h2>
          <a href="/admin/bookings" className="text-[#00A6C4] text-sm hover:underline">Lihat Semua →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Layanan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Total</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm">{booking.schedule_date || booking.created_at?.split('T')[0]}</td>
                  <td className="px-6 py-3 text-sm">{booking.service_type}</td>
                  <td className="px-6 py-3 text-sm">{booking.phone || '-'}</td>
                  <td className="px-6 py-3 text-center font-semibold">Rp{(booking.total_price || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada booking
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}