'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ServicesPage() {
  const services = [
    { name: 'Cuci AC 0.5 – 2 PK', price: 'Rp 85.000 – Rp 95.000', category: 'Cuci AC' },
    { name: 'Cuci AC Inverter 0.5 – 2 PK', price: 'Rp 130.000 – Rp 150.000', category: 'Cuci AC' },
    { name: 'Tambah Freon R22 0.5 – 1 PK', price: 'Rp 175.000', category: 'Freon' },
    { name: 'Tambah Freon R22 1.5 – 2 PK', price: 'Rp 225.000', category: 'Freon' },
    { name: 'Tambah Freon R32/R410 0.5 – 1 PK', price: 'Rp 225.000', category: 'Freon' },
    { name: 'Tambah Freon R32/R410 1.5 – 2 PK', price: 'Rp 275.000', category: 'Freon' },
    { name: 'Isi Freon R22 0.5 – 1 PK', price: 'Rp 275.000', category: 'Freon' },
    { name: 'Isi Freon R22 1.5 – 2 PK', price: 'Rp 325.000', category: 'Freon' },
    { name: 'Isi Freon R32/R410 0.5 – 1 PK', price: 'Rp 350.000', category: 'Freon' },
    { name: 'Isi Freon R32/R410 1.5 - 2 PK', price: 'Rp 450.000', category: 'Freon' },
    { name: 'Bongkar AC', price: 'Rp 175.000', category: 'Bongkar Pasang' },
    { name: 'Pasang AC 0.5 – 1 PK', price: 'Rp 300.000', category: 'Bongkar Pasang' },
    { name: 'Pasang AC 1.5 – 2 PK', price: 'Rp 375.000', category: 'Bongkar Pasang' },
    { name: 'Bongkar Pasang AC 0.5 – 1 PK', price: 'Rp 450.000', category: 'Bongkar Pasang' },
    { name: 'Bongkar Pasang AC 1.5 – 2 PK', price: 'Rp 500.000', category: 'Bongkar Pasang' },
    { name: 'Bobok Tembok per Meter', price: 'Rp 50.000', category: 'Tambahan' },
    { name: 'Las Sambungan Pipa Freon per titik', price: 'Rp 125.000', category: 'Perbaikan' },
    { name: 'Cuci Besar/Overhaul', price: 'Rp 170.000', category: 'Cuci AC' },
    { name: 'Vacuum & Flushing AC', price: 'Rp 350.000', category: 'Perawatan' },
    { name: 'Flushing Evaporator', price: 'Rp 200.000', category: 'Perawatan' },
    { name: 'Vacuum', price: 'Rp 150.000', category: 'Perawatan' },
    { name: 'Biaya Pengecekan AC**', price: 'Rp 75.000', category: 'Pengecekan', note: '**Biaya pengecekan tidak dikenakan apabila menggunakan jasa lainnya' },
  ];

  // Group by category
  const categories = {
    'Cuci AC': services.filter(s => s.category === 'Cuci AC'),
    'Freon': services.filter(s => s.category === 'Freon'),
    'Bongkar Pasang': services.filter(s => s.category === 'Bongkar Pasang'),
    'Perbaikan': services.filter(s => s.category === 'Perbaikan'),
    'Perawatan': services.filter(s => s.category === 'Perawatan'),
    'Tambahan': services.filter(s => s.category === 'Tambahan'),
    'Pengecekan': services.filter(s => s.category === 'Pengecekan'),
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#00A6C4] text-white text-sm px-4 py-1 rounded-full mb-3">
            ✨ Update 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-4">
            Daftar Harga Service AC
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Harga transparan, teknisi profesional, garansi terjamin
          </p>
        </div>

        {/* Kartu Info */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">👨‍🔧</div>
            <div className="font-bold text-[#0A2540]">Teknisi Profesional</div>
            <div className="text-xs text-gray-500">Bersertifikat & Berpengalaman</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">💰</div>
            <div className="font-bold text-[#0A2540]">Harga Transparan</div>
            <div className="text-xs text-gray-500">Tanpa biaya tersembunyi</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">✅</div>
            <div className="font-bold text-[#0A2540]">Garansi Service</div>
            <div className="text-xs text-gray-500">7-30 hari garansi</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl mb-1">🚀</div>
            <div className="font-bold text-[#0A2540]">24/7 Layanan</div>
            <div className="text-xs text-gray-500">Call center siap membantu</div>
          </div>
        </div>

        {/* Tabel Harga */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#0A2540] to-[#1a4a6e] text-white">
                  <th className="px-6 py-4 text-left">No</th>
                  <th className="px-6 py-4 text-left">Jasa Layanan</th>
                  <th className="px-6 py-4 text-center">Harga</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((service, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-500 font-medium text-center">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 font-medium text-[#0A2540]">
                      {service.name}
                      {service.note && (
                        <p className="text-xs text-gray-400 mt-1">{service.note}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="font-bold text-lg text-[#00A6C4]">
                        {service.price}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Link href="/booking">
                        <button className="bg-[#00A6C4] hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                          Booking
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informasi Penting */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
            <h3 className="font-bold text-lg mb-3 text-yellow-800 flex items-center gap-2">
              <span>⚠️</span> Informasi Penting
            </h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li>• *Jika ada harga jasa service yang kurang dari Rp 75.000, maka akan dikenakan biaya minimum sebesar Rp 75.000</li>
              <li>• **Biaya pengecekan tidak dikenakan apabila menggunakan jasa lainnya. Biaya ini dikenakan apabila Anda tidak jadi menggunakan jasa service AC lain yang tertera di atas</li>
              <li>• ***Untuk apartemen, dikenakan biaya penambahan sebesar Rp 20.000</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2">
              <span>✅</span> Keuntungan Booking di Mitra Teknik
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>✓ Teknisi datang tepat waktu</li>
              <li>✓ Garansi service 7-30 hari</li>
              <li>✓ Bebas biaya konsultasi</li>
              <li>✓ Pembayaran setelah service selesai</li>
              <li>✓ Spare part original dan bergaransi</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#0A2540] to-[#1a4a6e] rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Butuh Konsultasi?</h3>
          <p className="mb-5 opacity-90">Tim kami siap membantu memilih layanan AC yang tepat untuk Anda</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/booking">
              <button className="bg-[#00A6C4] hover:bg-cyan-500 px-8 py-3 rounded-2xl font-semibold transition">
                Booking Sekarang →
              </button>
            </Link>
            <Link href="/contact">
              <button className="border border-white hover:bg-white hover:text-[#0A2540] px-8 py-3 rounded-2xl font-semibold transition">
                Hubungi Kami
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}