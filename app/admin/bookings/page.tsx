'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const supabase = createClient();

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
      await Promise.all([loadBookings(), loadTechnicians()]);
    }
    checkAdminAndLoad();
  }, []);

  async function loadBookings() {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }

  async function loadTechnicians() {
    const { data } = await supabase
      .from('technicians')
      .select('*')
      .eq('status', 'active');
    setTechnicians(data || []);
  }

  async function updateStatus(bookingId: string, newStatus: string) {
    if (!confirm(`Ubah status booking menjadi ${newStatus}?`)) return;
    
    setUpdatingId(bookingId);
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (!error) {
      await loadBookings();
    } else {
      alert('Gagal update status: ' + error.message);
    }
    setUpdatingId(null);
  }

  async function assignTechnician(bookingId: string, teknisiId: string) {
    if (!teknisiId) return;
    
    setUpdatingId(bookingId);
    const selectedTech = technicians.find(t => t.id === teknisiId);
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        teknisi_id: teknisiId,
        teknisi_name: selectedTech?.name,
        status: 'confirmed'
      })
      .eq('id', bookingId);

    if (!error) {
      await loadBookings();
      alert(`Teknisi ${selectedTech?.name} telah ditugaskan!`);
    } else {
      alert('Gagal assign teknisi: ' + error.message);
    }
    setUpdatingId(null);
  }

  async function deleteBooking(bookingId: string) {
    if (!confirm('Yakin ingin menghapus booking ini? Tindakan ini tidak dapat dibatalkan!')) return;
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (!error) {
      await loadBookings();
    } else {
      alert('Gagal menghapus booking: ' + error.message);
    }
  }

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

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.includes(searchTerm) ||
      booking.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📋 Kelola Booking</h1>
          <p className="text-gray-500 mt-1">Semua pesanan service AC dari customer</p>
        </div>
        <button onClick={() => loadBookings()} className="bg-[#00A6C4] text-white px-4 py-2 rounded-xl hover:bg-cyan-500">
          🔄 Refresh
        </button>
      </div>

      {/* Filter dan Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="in_progress">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <input
            type="text"
            placeholder="Cari layanan, telepon, atau alamat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 w-64"
          />
        </div>
        <div className="text-sm text-gray-500">Total: {filteredBookings.length} booking</div>
      </div>

      {/* Tabel Booking */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500">Belum ada booking</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Layanan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Teknisi</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {booking.schedule_date || booking.created_at?.split('T')[0]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{booking.phone || '-'}</div>
                      <div className="text-xs text-gray-400">{booking.address?.substring(0, 30)}...</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{booking.service_type}</td>
                    <td className="px-4 py-3">
                      {booking.teknisi_name ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-600">👨‍🔧 {booking.teknisi_name}</span>
                        </div>
                      ) : (
                        <select
                          onChange={(e) => assignTechnician(booking.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 w-32"
                          disabled={booking.status !== 'pending'}
                          defaultValue=""
                        >
                          <option value="">Pilih Teknisi</option>
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.name} - {tech.specialization}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-[#00A6C4]">
                      Rp{(booking.total_price || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                        disabled={updatingId === booking.id}
                        className={`text-sm border rounded-lg px-2 py-1 ${getStatusBadge(booking.status)}`}
                      >
                        <option value="pending">Menunggu</option>
                        <option value="confirmed">Dikonfirmasi</option>
                        <option value="in_progress">Diproses</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Link href={`/tracking/${booking.id}`}>
                          <button className="text-blue-500 hover:text-blue-700 text-sm">🔍 Lihat</button>
                        </Link>
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistik Singkat */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-800">{bookings.length}</div>
          <div className="text-xs text-gray-500">Total Booking</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</div>
          <div className="text-xs text-gray-500">Menunggu</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{bookings.filter(b => b.status === 'in_progress').length}</div>
          <div className="text-xs text-gray-500">Diproses</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'completed').length}</div>
          <div className="text-xs text-gray-500">Selesai</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#00A6C4]">
            Rp{bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Pendapatan</div>
        </div>
      </div>
    </div>
  );
}