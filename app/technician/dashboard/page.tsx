'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TechnicianDashboardPage() {
  const [technician, setTechnician] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [showAddService, setShowAddService] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedService, setSelectedService] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Daftar layanan tambahan yang bisa dipilih teknisi
  const additionalServices = [
    { id: 'cuci', name: 'Cuci AC', price: 90000 },
    { id: 'freon_r22', name: 'Isi Freon R22', price: 275000 },
    { id: 'freon_r32', name: 'Isi Freon R32/R410', price: 350000 },
    { id: 'repair', name: 'Perbaikan AC', price: 120000 },
    { id: 'vacuum', name: 'Vacuum AC', price: 150000 },
    { id: 'overhaul', name: 'Cuci Besar/Overhaul', price: 170000 },
  ];

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/technician/login');
        return;
      }

      const { data: techData } = await supabase
        .from('technicians')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!techData) {
        router.push('/technician/login');
        return;
      }
      setTechnician(techData);

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('teknisi_id', techData.id)
        .order('schedule_date', { ascending: true });

      setBookings(bookingsData || []);
      setLoading(false);
    }
    loadData();
  }, []);

  async function updateStatus(bookingId: string, newStatus: string) {
    if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;

    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', bookingId);

    if (!error) {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('teknisi_id', technician.id);
      setBookings(bookingsData || []);
      alert('Status berhasil diupdate!');
    } else {
      alert('Gagal update status: ' + error.message);
    }
  }

  async function addAdditionalService() {
    if (!selectedBooking || !selectedService) return;
    
    setUpdating(true);
    const service = additionalServices.find(s => s.id === selectedService);
    if (!service) return;

    // Ambil additional_services yang sudah ada
    const existingServices = selectedBooking.additional_services || [];
    const newServices = [...existingServices, {
      name: service.name,
      price: service.price,
      added_at: new Date().toISOString()
    }];

    // Hitung total baru
    const originalTotal = selectedBooking.original_total || selectedBooking.total_price;
    const newTotal = originalTotal + newServices.reduce((sum, s) => sum + s.price, 0);

    const { error } = await supabase
      .from('bookings')
      .update({
        additional_services: newServices,
        total_price: newTotal,
        updated_by: technician.name,
        updated_at: new Date().toISOString(),
        notes: `${selectedBooking.notes || ''}\n[${new Date().toLocaleDateString()}] Tambah: ${service.name} +Rp${service.price.toLocaleString()}`
      })
      .eq('id', selectedBooking.id);

    if (!error) {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('teknisi_id', technician.id);
      setBookings(bookingsData || []);
      setShowAddService(false);
      setSelectedBooking(null);
      setSelectedService('');
      alert('Layanan tambahan berhasil ditambahkan! Total harga sudah diupdate.');
    } else {
      alert('Gagal tambah layanan: ' + error.message);
    }
    setUpdating(false);
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
      pending: 'Menunggu Konfirmasi',
      confirmed: 'Dikonfirmasi',
      in_progress: 'Sedang Dikerjakan',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return textMap[status] || status;
  };

  const ongoingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar */}
      <header className="bg-[#0A2540] text-white p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Mitra Teknik</h1>
            <p className="text-xs text-cyan-300">Teknisi: {technician?.name}</p>
          </div>
          <div className="flex gap-4">
            <span className="text-sm">⭐ {technician?.rating}</span>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/technician/login');
              }}
              className="bg-red-500 px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'ongoing' 
                ? 'bg-[#00A6C4] text-white' 
                : 'bg-white text-gray-600'
            }`}
          >
            🔧 Sedang Berjalan ({ongoingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              activeTab === 'completed' 
                ? 'bg-[#00A6C4] text-white' 
                : 'bg-white text-gray-600'
            }`}
          >
            ✅ Selesai ({completedBookings.length})
          </button>
        </div>

        {/* Modal Tambah Layanan */}
        {showAddService && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Tambah Layanan</h3>
              <p className="text-sm text-gray-500 mb-4">
                Booking: {selectedBooking.service_type}<br/>
                Total saat ini: <span className="font-bold">Rp{selectedBooking.total_price?.toLocaleString()}</span>
              </p>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 mb-4"
              >
                <option value="">Pilih layanan tambahan...</option>
                {additionalServices.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - Rp{service.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={addAdditionalService}
                  disabled={!selectedService || updating}
                  className="flex-1 bg-[#00A6C4] text-white py-2 rounded-xl disabled:opacity-50"
                >
                  {updating ? 'Memproses...' : 'Tambah Layanan'}
                </button>
                <button
                  onClick={() => {
                    setShowAddService(false);
                    setSelectedBooking(null);
                    setSelectedService('');
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-xl"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Sedang Berjalan */}
        {activeTab === 'ongoing' && (
          <>
            {ongoingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">Tidak ada booking sedang berjalan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ongoingBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{booking.service_type}</h3>
                        <p className="text-sm text-gray-500">
                          📅 {booking.schedule_date} {booking.schedule_time ? `⏰ ${booking.schedule_time}` : ''}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex gap-2">
                        <span className="text-gray-400">👤</span>
                        <span>{booking.phone}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-400">📍</span>
                        <span className="flex-1">{booking.address}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-400">💰</span>
                        <span className="font-bold text-[#00A6C4]">Rp{booking.total_price?.toLocaleString()}</span>
                      </div>
                      
                      {/* Tampilkan layanan tambahan yang sudah ditambahkan */}
                      {booking.additional_services?.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                          <p className="text-xs font-semibold text-yellow-700">Layanan Tambahan:</p>
                          {booking.additional_services.map((s: any, idx: number) => (
                            <p key={idx} className="text-xs text-yellow-600">+ {s.name}: Rp{s.price.toLocaleString()}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowAddService(true);
                            }}
                            className="bg-yellow-500 text-white px-3 py-2 rounded-xl text-sm font-semibold"
                          >
                            ➕ Tambah Layanan
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, 'in_progress')}
                            className="bg-purple-500 text-white px-3 py-2 rounded-xl text-sm font-semibold"
                          >
                            🚗 Mulai Perjalanan
                          </button>
                        </>
                      )}
                      {booking.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowAddService(true);
                            }}
                            className="bg-yellow-500 text-white px-3 py-2 rounded-xl text-sm font-semibold"
                          >
                            ➕ Tambah Layanan
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, 'completed')}
                            className="bg-green-500 text-white px-3 py-2 rounded-xl text-sm font-semibold"
                          >
                            ✅ Selesaikan Service
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Booking Selesai */}
        {activeTab === 'completed' && (
          <>
            {completedBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-500">Belum ada booking selesai</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{booking.service_type}</h4>
                        <p className="text-xs text-gray-400">{booking.schedule_date}</p>
                        {booking.additional_services?.length > 0 && (
                          <p className="text-xs text-yellow-600 mt-1">
                            +{booking.additional_services.length} layanan tambahan
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                          Selesai
                        </span>
                        <p className="text-sm font-semibold mt-1">Rp{booking.total_price?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}