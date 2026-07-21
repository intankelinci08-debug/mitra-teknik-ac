'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'fixed',
    discount_value: 10000,
    min_purchase: 50000,
    max_discount: 0,
    valid_to: '',
    usage_limit: 100,
  });
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
      await loadVouchers();
    }
    checkAdminAndLoad();
  }, []);

  async function loadVouchers() {
    setLoading(true);
    const { data } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    setVouchers(data || []);
    setLoading(false);
  }

  async function saveVoucher(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const validTo = formData.valid_to || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const maxDiscount = formData.discount_type === 'percentage' ? formData.max_discount || null : null;

    if (editingVoucher) {
      // Update
      const { error } = await supabase
        .from('vouchers')
        .update({
          code: formData.code.toUpperCase(),
          description: formData.description,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          min_purchase: formData.min_purchase,
          max_discount: maxDiscount,
          valid_to: validTo,
          usage_limit: formData.usage_limit,
        })
        .eq('id', editingVoucher.id);

      if (error) {
        alert('Gagal update: ' + error.message);
      } else {
        alert('Voucher berhasil diupdate!');
        resetForm();
        await loadVouchers();
      }
    } else {
      // Create
      const { error } = await supabase
        .from('vouchers')
        .insert({
          code: formData.code.toUpperCase(),
          description: formData.description,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          min_purchase: formData.min_purchase,
          max_discount: maxDiscount,
          valid_to: validTo,
          usage_limit: formData.usage_limit,
          is_active: true,
        });

      if (error) {
        alert('Gagal simpan: ' + error.message);
      } else {
        alert('Voucher berhasil dibuat!');
        resetForm();
        await loadVouchers();
      }
    }
    setLoading(false);
  }

  async function toggleStatus(voucher: any) {
    const { error } = await supabase
      .from('vouchers')
      .update({ is_active: !voucher.is_active })
      .eq('id', voucher.id);

    if (!error) {
      await loadVouchers();
    } else {
      alert('Gagal update status: ' + error.message);
    }
  }

  async function deleteVoucher(id: string) {
    if (!confirm('Yakin ingin menghapus voucher ini?')) return;
    
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadVouchers();
    } else {
      alert('Gagal hapus: ' + error.message);
    }
  }

  function editVoucher(voucher: any) {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description || '',
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_purchase: voucher.min_purchase,
      max_discount: voucher.max_discount || 0,
      valid_to: voucher.valid_to?.split('T')[0] || '',
      usage_limit: voucher.usage_limit,
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingVoucher(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'fixed',
      discount_value: 10000,
      min_purchase: 50000,
      max_discount: 0,
      valid_to: '',
      usage_limit: 100,
    });
  }

  function generateRandomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let code = 'MITRA-';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      if (i < 2) code += '-';
    }
    setFormData({ ...formData, code });
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  if (!isAdmin) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🎫 Kelola Voucher</h1>
          <p className="text-gray-500 mt-1">Buat dan kelola kode diskon untuk customer</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#00A6C4] text-white px-5 py-2 rounded-xl hover:bg-cyan-500 transition"
        >
          {showForm ? '✕ Tutup Form' : '+ Buat Voucher Baru'}
        </button>
      </div>

      {/* Form Buat/Edit Voucher */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
          <h2 className="font-bold text-lg mb-4">
            {editingVoucher ? '✏️ Edit Voucher' : '✨ Buat Voucher Baru'}
          </h2>
          <form onSubmit={saveVoucher} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Kode Voucher *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="flex-1 rounded-xl border border-gray-200 p-3 font-mono"
                  placeholder="MITRA-XXXX-XXXX"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="bg-gray-200 hover:bg-gray-300 px-4 rounded-xl transition"
                >
                  🔄 Random
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Deskripsi</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder="Diskon untuk customer baru"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tipe Diskon</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
              >
                <option value="fixed">Nominal Tetap (Rp)</option>
                <option value="percentage">Persen (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                {formData.discount_type === 'fixed' ? 'Nominal Diskon (Rp)' : 'Persen Diskon (%)'}
              </label>
              <input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Minimal Belanja (Rp)</label>
              <input
                type="number"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 p-3"
              />
            </div>
            {formData.discount_type === 'percentage' && (
              <div>
                <label className="block text-sm font-semibold mb-1">Maksimal Diskon (Rp)</label>
                <input
                  type="number"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 p-3"
                  placeholder="Opsional"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1">Berlaku Sampai</label>
              <input
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Maksimal Penggunaan</label>
              <input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 p-3"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-[#00A6C4] text-white px-6 py-2 rounded-xl hover:bg-cyan-500">
                {editingVoucher ? 'Update Voucher' : 'Simpan Voucher'}
              </button>
              <button type="button" onClick={resetForm} className="border border-gray-300 px-6 py-2 rounded-xl hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Voucher */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-gray-500">Belum ada voucher</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-[#00A6C4] text-white px-4 py-2 rounded-xl"
          >
            + Buat Voucher Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Kode Voucher</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Deskripsi</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Diskon</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Min. Belanja</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Terpakai</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono font-bold">
                        {voucher.code}
                      </code>
                    </td>
                    <td className="px-6 py-3 text-sm">{voucher.description || '-'}</td>
                    <td className="px-6 py-3 text-center font-semibold text-green-600">
                      {voucher.discount_type === 'fixed' 
                        ? `Rp${voucher.discount_value.toLocaleString()}`
                        : `${voucher.discount_value}%`}
                      {voucher.max_discount > 0 && ` (max Rp${voucher.max_discount.toLocaleString()})`}
                    </td>
                    <td className="px-6 py-3 text-center text-sm">
                      Rp{voucher.min_purchase?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-3 text-center text-sm">
                      {voucher.usage_count || 0} / {voucher.usage_limit}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(voucher.is_active)}`}>
                        {voucher.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => toggleStatus(voucher)}
                          className={`text-xs px-2 py-1 rounded ${voucher.is_active ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {voucher.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => editVoucher(voucher)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteVoucher(voucher.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
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
    </div>
  );
}