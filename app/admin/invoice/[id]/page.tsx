'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminInvoiceDetailPage() {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      if (!params?.id) return;
      
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', params.id)
        .single();
      
      setBooking(data);
      setLoading(false);
    }
    loadData();
  }, [params?.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Booking tidak ditemukan</h2>
          <Link href="/admin/invoice">
            <button className="bg-[#00A6C4] text-white px-6 py-2 rounded-xl">
              Kembali ke Daftar Invoice
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const invoiceNumber = booking.invoice_number || `INV-${booking.id?.slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(booking.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedCompletedDate = booking.completed_at 
    ? new Date(booking.completed_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '-';

  // Hitung subtotal (harga awal)
  const subtotal = booking.original_total || booking.total_price || 0;
  // Hitung total layanan tambahan
  const additionalTotal = booking.additional_services?.reduce((sum: number, s: any) => sum + s.price, 0) || 0;
  // Total akhir
  const finalTotal = booking.total_price || 0;

  return (
    <div id="invoice-print-area" className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Tombol Print */}
        <div className="mb-4 text-right print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 mr-2"
          >
            🖨️ Print / Save PDF
          </button>
          <Link href="/admin/invoice">
            <button className="border border-gray-300 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-50">
              ← Kembali ke Daftar Invoice
            </button>
          </Link>
        </div>

        {/* INVOICE CONTENT */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="border-b border-gray-200 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">MITRA TEKNIK</h1>
                <p className="text-gray-500 mt-1">Engineering & AC Service</p>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Jl. Raya No. 123, Jakarta Selatan</p>
                  <p>Telp: (021) 1234-5678 | WA: 0812-3456-7890</p>
                  <p>Email: info@mitrateknik.com</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-blue-50 px-6 py-3 rounded-lg">
                  <p className="text-sm text-gray-500">INVOICE</p>
                  <p className="text-2xl font-bold text-blue-600">{invoiceNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Invoice Info */}
          <div className="p-8 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">BILL TO:</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{booking.phone || 'Customer'}</p>
                  <p>{booking.address}</p>
                  <p>Telp: {booking.phone || '-'}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500 text-left">Invoice Date:</div>
                  <div className="text-gray-700 text-right">{formattedDate}</div>
                  <div className="text-gray-500 text-left">Service Date:</div>
                  <div className="text-gray-700 text-right">{booking.schedule_date || formattedDate}</div>
                  <div className="text-gray-500 text-left">Complete Date:</div>
                  <div className="text-gray-700 text-right">{formattedCompletedDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-gray-600 font-semibold">Description</th>
                  <th className="text-center py-3 text-gray-600 font-semibold">Qty</th>
                  <th className="text-right py-3 text-gray-600 font-semibold">Unit Price</th>
                  <th className="text-right py-3 text-gray-600 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Layanan Utama */}
                <tr className="border-b border-gray-100">
                  <td className="py-4 text-gray-700">
                    <div className="font-medium">{booking.service_type}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Teknisi: {booking.teknisi_name || '-'} | Tipe AC: {booking.ac_type || '-'} | Unit: {booking.unit_count || 1}
                    </div>
                  </td>
                  <td className="py-4 text-center text-gray-700">{booking.unit_count || 1}</td>
                  <td className="py-4 text-right text-gray-700">
                    Rp{Math.round((subtotal) / (booking.unit_count || 1)).toLocaleString()}
                  </td>
                  <td className="py-4 text-right font-medium text-gray-700">
                    Rp{subtotal.toLocaleString()}
                  </td>
                </tr>
                
                {/* Layanan Tambahan */}
                {booking.additional_services && booking.additional_services.length > 0 && (
                  <>
                    {booking.additional_services.map((service: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 bg-yellow-50">
                        <td className="py-3 text-gray-700">
                          <div className="font-medium">➕ {service.name} <span className="text-xs text-yellow-600">(Layanan Tambahan)</span></div>
                          <div className="text-xs text-gray-400 mt-1">Ditambahkan oleh teknisi</div>
                        </td>
                        <td className="py-3 text-center text-gray-700">1</td>
                        <td className="py-3 text-right text-gray-700">Rp{service.price.toLocaleString()}</td>
                        <td className="py-3 text-right font-medium text-gray-700">Rp{service.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>

            {/* Total Section */}
            <div className="mt-6 flex justify-end">
              <div className="w-80">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-700">Rp{subtotal.toLocaleString()}</span>
                </div>
                
                {additionalTotal > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Layanan Tambahan:</span>
                    <span className="text-orange-600">+ Rp{additionalTotal.toLocaleString()}</span>
                  </div>
                )}
                
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Discount:</span>
                    <span className="text-red-500">- Rp{booking.discount_amount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 mt-2">
                  <span className="text-lg font-bold text-gray-700">TOTAL:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    Rp{finalTotal.toLocaleString()}
                  </span>
                </div>
                <div className="text-right text-xs text-gray-400 mt-2">
                  *Pembayaran dapat dilakukan di tempat / transfer
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info & Bank Account */}
          <div className="bg-gray-50 p-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Payment Method:</h4>
                <div className="text-sm text-gray-600">
                  <p>✅ Cash on Delivery (Bayar di Tempat)</p>
                  <p>✅ Bank Transfer (BCA / Mandiri / BRI)</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Bank Account:</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>BCA</strong> - 1234567890 a.n Mitra Teknik</p>
                  <p><strong>Mandiri</strong> - 9876543210 a.n Mitra Teknik</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Proof */}
          {booking.proof_photo_url && (
            <div className="p-8 border-t border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3">📸 Service Completion Proof:</h4>
              <div className="bg-gray-100 rounded-lg p-4 inline-block">
                <img 
                  src={booking.proof_photo_url} 
                  alt="Bukti Service" 
                  className="max-w-full h-auto max-h-64 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-6 border-t border-gray-200 text-gray-400 text-xs">
            <p>Thank you for choosing Mitra Teknik</p>
            <p className="mt-1">Garansi service 7-30 hari • Teknisi bersertifikat • 24/7 Customer Support</p>
            <p className="mt-2">This is a computer generated invoice. No signature required.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Sembunyikan SEMUA elemen admin */
          aside,
          nav,
          header:not(.invoice-header),
          .admin-sidebar,
          .print\\:hidden,
          button,
          .no-print,
          .sticky,
          .fixed,
          [class*="sidebar"],
          [class*="navbar"],
          [class*="admin"] {
            display: none !important;
          }
          
          /* Reset body untuk print */
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Main content full width */
          main, 
          .min-h-screen,
          .p-6,
          .max-w-4xl {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          
          /* Invoice area */
          #invoice-print-area {
            margin: 0 auto !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          
          /* Sembunyikan bagian footer admin */
          footer,
          .text-gray-400.text-xs,
          .border-t {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}