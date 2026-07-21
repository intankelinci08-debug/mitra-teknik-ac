import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  const services = [
    { name: 'Cuci AC', price: 'Mulai Rp75rb', icon: '❄️' },
    { name: 'Isi Freon', price: 'Mulai Rp150rb', icon: '🧊' },
    { name: 'Perbaikan AC', price: 'Mulai Rp120rb', icon: '🛠️' },
    { name: 'Instalasi AC', price: 'Mulai Rp350rb', icon: '🏠' },
  ];

  const orders = [
    {
      service: 'Cuci AC 2 Unit',
      status: 'Dalam Proses',
      date: '22 Mei 2026',
      technician: 'Pramono',
      total: 'Rp250.000',
    },
    {
      service: 'Isi Freon',
      status: 'Selesai',
      date: '18 Mei 2026',
      technician: 'Agus',
      total: 'Rp180.000',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#0A2540] font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0A2540] text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="hover:opacity-90 transition">
            <div>
              <h1 className="text-2xl font-bold">Mitra Teknik</h1>
              <p className="text-sm text-cyan-200">Engineering & AC Service</p>
            </div>
          </Link>

          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-cyan-300 transition">Home</Link>
            <Link href="/booking" className="hover:text-cyan-300 transition">Booking</Link>
            <Link href="/history" className="hover:text-cyan-300 transition">Riwayat</Link>
            <Link href="/dashboard" className="hover:text-cyan-300 transition">Dashboard</Link>
          </nav>

          <Link href="/login">
            <button className="bg-[#00A6C4] hover:bg-cyan-500 transition px-5 py-2 rounded-xl font-semibold text-white">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0A2540] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="uppercase tracking-widest text-cyan-300 mb-3">Professional AC Engineering</p>
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Service AC Modern dengan Tracking Real-time
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Booking teknisi AC, monitoring proses service, pembayaran online,
              dan laporan lengkap dalam satu platform modern.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link href="/booking">
                <button className="bg-[#00A6C4] hover:bg-cyan-500 px-6 py-3 rounded-2xl font-semibold shadow-lg transition transform hover:scale-105">
                  🚀 Booking Sekarang
                </button>
              </Link>

              <Link href="/services">
              <button className="border border-cyan-300 text-cyan-200 hover:bg-white hover:text-[#0A2540] px-6 py-3 rounded-2xl font-semibold transition">
                  📋 Lihat Layanan
                </button>
              </Link>
            </div>

            <div className="mt-8 flex gap-6 text-sm text-cyan-200">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Teknisi Bersertifikat
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Garansi 7 Hari
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Harga Transparan
              </div>
            </div>
          </div>

          <div className="transform hover:scale-105 transition duration-300">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="bg-white rounded-2xl p-5 text-[#0A2540]">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-bold text-lg">📍 Tracking Service</h3>
                    <p className="text-sm text-gray-500">Order #INV-2205</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
                    🚗 Teknisi OTW
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-xl">
                      👨‍🔧
                    </div>
                    <div>
                      <p className="font-semibold">Pramono</p>
                      <p className="text-sm text-gray-500">Teknisi Senior AC - 4.9⭐</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>📅 Order Dibuat</span>
                      <span className="text-green-600">✔️</span>
                    </div>
                    <div className="flex justify-between">
                      <span>👨‍🔧 Teknisi Ditugaskan</span>
                      <span className="text-green-600">✔️</span>
                    </div>
                    <div className="flex justify-between font-semibold text-cyan-700">
                      <span>🚗 Menuju Lokasi</span>
                      <span className="animate-pulse">🚗💨</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>🔧 Pengerjaan</span>
                      <span>⏳</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>✅ Selesai</span>
                      <span>⏳</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-cyan-600 font-semibold mb-2">✨ LAYANAN KAMI</p>
              <h3 className="text-4xl font-bold">Pilih Layanan AC</h3>
              <p className="text-gray-500 mt-2">Layanan profesional dengan teknisi berpengalaman</p>
            </div>

            <Link href="/booking">
              <button className="hidden md:block bg-[#0A2540] hover:bg-[#1a3a5c] text-white px-5 py-3 rounded-xl transition">
                Lihat Semua →
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-cyan-200 group cursor-pointer transform hover:-translate-y-1"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition">{service.icon}</div>
                <h4 className="font-bold text-xl mb-2">{service.name}</h4>
                <p className="text-gray-500 mb-5">{service.price}</p>
                <Link href="/booking">
                  <button className="w-full bg-[#00A6C4] hover:bg-cyan-500 text-white py-3 rounded-xl font-semibold transition group-hover:shadow-lg">
                    Booking Now →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form (Contoh) - opsional, bisa dihapus jika sudah punya halaman booking sendiri */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-cyan-600 font-semibold mb-2">BOOKING ONLINE</p>
            <h3 className="text-4xl font-bold mb-6">Pesan Service AC</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Jenis Layanan</label>
                <select className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50">
                  <option>Cuci AC</option>
                  <option>Isi Freon</option>
                  <option>Perbaikan AC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Alamat</label>
                <textarea
                  className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50 h-28"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Tanggal</label>
                  <input type="date" className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Jam</label>
                  <input type="time" className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50" />
                </div>
              </div>

              <Link href="/booking">
                <button className="w-full bg-[#0A2540] hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition">
                  Lanjut Pembayaran →
                </button>
              </Link>
            </div>
          </div>

          <div className="bg-[#0A2540] text-white rounded-3xl p-8 shadow-2xl">
            <h4 className="text-2xl font-bold mb-6">Ringkasan Order</h4>
            <div className="space-y-5 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Layanan</span>
                <span>Cuci AC 2 Unit</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Teknisi</span>
                <span>Pramono</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Jadwal</span>
                <span>22 Mei 2026</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Pembayaran</span>
                <span>QRIS</span>
              </div>
            </div>
            <div className="mt-8 bg-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>Rp250.000</span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-white text-[#0A2540] py-3 rounded-xl font-semibold">QRIS</button>
              <button className="flex-1 bg-cyan-500 text-white py-3 rounded-xl font-semibold">Virtual Account</button>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-cyan-600 font-semibold mb-2">RIWAYAT SERVICE</p>
            <h3 className="text-4xl font-bold">Aktivitas Customer</h3>
          </div>

          <div className="grid gap-6">
            {orders.map((order, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <h4 className="font-bold text-xl mb-2">{order.service}</h4>
                  <p className="text-gray-500">{order.date}</p>
                  <p className="text-gray-500">Teknisi: {order.technician}</p>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="font-bold text-lg">{order.total}</div>
                <div className="flex gap-3 flex-wrap">
                  <button className="bg-[#0A2540] text-white px-5 py-3 rounded-xl text-sm font-semibold">Download Invoice</button>
                  <Link href="/booking">
                    <button className="bg-[#00A6C4] text-white px-5 py-3 rounded-xl text-sm font-semibold">Repeat Order</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-cyan-600 font-semibold mb-2">REVIEW CUSTOMER</p>
            <h3 className="text-4xl font-bold">Apa Kata Customer Kami</h3>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Review terbaik dari customer setelah menggunakan layanan Mitra Teknik.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#F3F4F6] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-1 text-yellow-500 mb-4 text-xl">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 leading-relaxed mb-5">Teknisi datang tepat waktu dan hasil cuci AC sangat bersih. Recommended.</p>
              <div><p className="font-bold">Budi Santoso</p><p className="text-sm text-gray-500">Customer Jakarta Selatan</p></div>
            </div>
            <div className="bg-[#0A2540] text-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-1 text-yellow-400 mb-4 text-xl">⭐⭐⭐⭐⭐</div>
              <p className="leading-relaxed mb-5 text-gray-200">Booking mudah, pembayaran QRIS cepat, dan bisa tracking teknisi realtime.</p>
              <div><p className="font-bold">Intan Permadani</p><p className="text-sm text-gray-300">Customer Tangerang Selatan</p></div>
            </div>
            <div className="bg-[#F3F4F6] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-1 text-yellow-500 mb-4 text-xl">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 leading-relaxed mb-5">Sangat cocok untuk maintenance AC kos dan apartemen karena histori service tersimpan.</p>
              <div><p className="font-bold">Andi Wijaya</p><p className="text-sm text-gray-500">Customer Bekasi</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="grid grid-cols-4 text-center py-3 text-xs">
          <Link href="/" className="flex flex-col items-center text-cyan-600 font-semibold">
            <span className="text-lg">🏠</span>
            Home
          </Link>
          <Link href="/booking" className="flex flex-col items-center text-gray-500 hover:text-cyan-600">
            <span className="text-lg">❄️</span>
            Layanan
          </Link>
          <Link href="/history" className="flex flex-col items-center text-gray-500 hover:text-cyan-600">
            <span className="text-lg">📄</span>
            Riwayat
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-cyan-600">
            <span className="text-lg">👤</span>
            Profil
          </Link>
        </div>
      </div>
    </div>
  );
}