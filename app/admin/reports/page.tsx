'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminReportsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const router = useRouter();
  const supabase = createClient();

  const COLORS = ['#00A6C4', '#0A2540', '#F59E0B', '#10B981', '#EF4444'];

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
      await loadData();
    }
    checkAdminAndLoad();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: true });
    setBookings(data || []);
    setLoading(false);
  }

  // Proses data untuk grafik pendapatan per periode
  const getChartData = () => {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const now = new Date();
    const data: { name: string; revenue: number; count: number }[] = [];

    if (dateRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
        
        const dayRevenue = completedBookings
          .filter(b => b.created_at?.split('T')[0] === dateStr)
          .reduce((sum, b) => sum + (b.total_price || 0), 0);
        const dayCount = completedBookings
          .filter(b => b.created_at?.split('T')[0] === dateStr).length;
        
        data.push({ name: dayName, revenue: dayRevenue, count: dayCount });
      }
    } else if (dateRange === 'month') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRevenue = completedBookings
          .filter(b => b.created_at?.split('T')[0] === dateStr)
          .reduce((sum, b) => sum + (b.total_price || 0), 0);
        const dayCount = completedBookings
          .filter(b => b.created_at?.split('T')[0] === dateStr).length;
        
        data.push({ name: `${date.getDate()}`, revenue: dayRevenue, count: dayCount });
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
        
        const monthRevenue = completedBookings
          .filter(b => b.created_at?.slice(0, 7) === monthStr)
          .reduce((sum, b) => sum + (b.total_price || 0), 0);
        const monthCount = completedBookings
          .filter(b => b.created_at?.slice(0, 7) === monthStr).length;
        
        data.push({ name: monthName, revenue: monthRevenue, count: monthCount });
      }
    }
    return data;
  };

  // Data untuk pie chart (status booking)
  const getStatusData = () => {
    const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    const statusLabels: Record<string, string> = {
      pending: 'Menunggu',
      in_progress: 'Diproses',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return statuses.map(status => ({
      name: statusLabels[status],
      value: bookings.filter(b => b.status === status).length,
      color: status === 'pending' ? '#F59E0B' : status === 'in_progress' ? '#8B5CF6' : status === 'completed' ? '#10B981' : '#EF4444',
    }));
  };

  // Data untuk pendapatan per layanan
  const getServiceRevenueData = () => {
    const services: Record<string, number> = {};
    bookings
      .filter(b => b.status === 'completed')
      .forEach(b => {
        const serviceName = b.service_type || 'Lainnya';
        services[serviceName] = (services[serviceName] || 0) + (b.total_price || 0);
      });
    return Object.entries(services)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Layanan', 'Customer', 'Total', 'Status'];
    const rows = bookings.map(b => [
      b.id?.slice(0, 8),
      b.created_at?.split('T')[0],
      b.service_type,
      b.phone || '-',
      b.total_price || 0,
      b.status,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_keuangan_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF (print friendly)
  const printReport = () => {
    window.print();
  };

  const chartData = getChartData();
  const statusData = getStatusData();
  const serviceRevenueData = getServiceRevenueData();
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_price || 0), 0);
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  if (!isAdmin) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📈 Laporan Keuangan</h1>
          <p className="text-gray-500 mt-1">Analisis pendapatan dan statistik booking</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
          >
            📊 Export CSV
          </button>
          <button
            onClick={printReport}
            className="bg-[#0A2540] text-white px-4 py-2 rounded-xl hover:bg-[#1a3a5c] transition"
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pendapatan</p>
              <p className="text-3xl font-bold text-green-600">Rp{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Booking</p>
              <p className="text-3xl font-bold text-gray-800">{totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Booking Selesai</p>
              <p className="text-3xl font-bold text-green-600">{completedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rata-rata per Booking</p>
              <p className="text-3xl font-bold text-[#00A6C4]">
                Rp{completedBookings > 0 ? Math.round(totalRevenue / completedBookings).toLocaleString() : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-2xl">📊</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-xl transition ${dateRange === 'week' ? 'bg-[#00A6C4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-xl transition ${dateRange === 'month' ? 'bg-[#00A6C4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-xl transition ${dateRange === 'year' ? 'bg-[#00A6C4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            12 Bulan
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setChartType('line')}
            className={`px-4 py-2 rounded-xl transition ${chartType === 'line' ? 'bg-[#00A6C4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            📈 Line Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-xl transition ${chartType === 'bar' ? 'bg-[#00A6C4] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            📊 Bar Chart
          </button>
        </div>
      </div>

      {/* Grafik Pendapatan */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="font-bold text-lg mb-4">📈 Grafik Pendapatan</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`Rp${value.toLocaleString()}`, 'Pendapatan']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#00A6C4" strokeWidth={2} name="Pendapatan" />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`Rp${value.toLocaleString()}`, 'Pendapatan']} />
                <Legend />
                <Bar dataKey="revenue" fill="#00A6C4" name="Pendapatan" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dua Grafik Bawah */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart Status Booking */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">📊 Status Booking</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Layanan Terlaris */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg mb-4">🏆 Top 5 Layanan Terlaris</h2>
          {serviceRevenueData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {serviceRevenueData.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📌'}</span>
                    <span className="text-sm truncate">{service.name}</span>
                  </div>
                  <div className="font-semibold text-[#00A6C4]">Rp{service.value.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Data Lengkap */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg">📋 Data Lengkap Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Layanan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.slice(0, 20).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{booking.created_at?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-sm">{booking.service_type}</td>
                  <td className="px-4 py-3 text-sm">{booking.phone || '-'}</td>
                  <td className="px-4 py-3 text-center font-semibold">Rp{(booking.total_price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status === 'completed' ? 'Selesai' :
                       booking.status === 'pending' ? 'Menunggu' :
                       booking.status === 'in_progress' ? 'Diproses' : 'Dibatalkan'}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}