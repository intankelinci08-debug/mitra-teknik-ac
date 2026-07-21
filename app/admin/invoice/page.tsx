'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminInvoiceListPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
      await loadCompletedBookings();
    }
    checkAdminAndLoad();
  }, []);

  async function loadCompletedBookings() {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }

  if (!isAdmin) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📄 Daftar Invoice</h1>
          <p className="text-gray-500 mt-1">Semua invoice dari booking yang sudah selesai</p>
        </div>
        <button onClick={loadCompletedBookings} className="bg-[#00A6C4] text-white px-4 py-2 rounded-xl">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500">Belum ada booking yang selesai</p>
          <Link href="/admin/bookings">
            <button className="mt-4 bg-[#00A6C4] text-white px-4 py-2 rounded-xl">
              Lihat Kelola Booking
            </button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">No Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Layanan</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Teknisi</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => {
                  const invoiceNumber = booking.invoice_number || `INV-${booking.id?.slice(0, 8).toUpperCase()}`;
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {invoiceNumber}
                        </code>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {new Date(booking.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-medium">{booking.phone || '-'}</div>
                        <div className="text-xs text-gray-400">{booking.address?.substring(0, 30)}...</div>
                      </td>
                      <td className="px-6 py-3 text-sm">{booking.service_type}</td>
                      <td className="px-6 py-3 text-center font-semibold text-[#00A6C4]">
                        Rp{(booking.total_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center text-sm">
                        {booking.teknisi_name || '-'}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Link href={`/admin/invoice/${booking.id}`}>
                          <button className="bg-[#00A6C4] text-white px-4 py-2 rounded-xl text-sm hover:bg-cyan-500 transition">
                            📄 Lihat Invoice
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#0A2540]">{bookings.length}</div>
            <div className="text-xs text-gray-500">Total Invoice</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              Rp{bookings.reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Total Pendapatan</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#00A6C4]">
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
            <div className="text-xs text-gray-500">Periode</div>
          </div>
        </div>
      )}
    </div>
  );
}