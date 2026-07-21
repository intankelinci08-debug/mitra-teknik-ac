'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTech, setEditingTech] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience_years: 0,
    rating: 0,
    status: 'active',
    daily_rate: 0,
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
      await loadTechnicians();
    }
    checkAdminAndLoad();
  }, []);

  async function loadTechnicians() {
    setLoading(true);
    const { data } = await supabase
      .from('technicians')
      .select('*')
      .order('name', { ascending: true });
    setTechnicians(data || []);
    setLoading(false);
  }

  async function saveTechnician(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (editingTech) {
      // Update
      const { error } = await supabase
        .from('technicians')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          experience_years: formData.experience_years,
          rating: formData.rating,
          status: formData.status,
          daily_rate: formData.daily_rate,
        })
        .eq('id', editingTech.id);

      if (error) {
        alert('Gagal update: ' + error.message);
      } else {
        alert('Teknisi berhasil diupdate!');
        resetForm();
        await loadTechnicians();
      }
    } else {
      // Create
      const { error } = await supabase
        .from('technicians')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          experience_years: formData.experience_years,
          rating: formData.rating,
          status: formData.status,
          daily_rate: formData.daily_rate,
        });

      if (error) {
        alert('Gagal simpan: ' + error.message);
      } else {
        alert('Teknisi berhasil ditambahkan!');
        resetForm();
        await loadTechnicians();
      }
    }
    setLoading(false);
  }

  async function deleteTechnician(id: string) {
    if (!confirm('Yakin ingin menghapus teknisi ini?')) return;
    
    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadTechnicians();
    } else {
      alert('Gagal hapus: ' + error.message);
    }
  }

  function editTechnician(tech: any) {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email || '',
      phone: tech.phone,
      specialization: tech.specialization || '',
      experience_years: tech.experience_years,
      rating: tech.rating,
      status: tech.status,
      daily_rate: tech.daily_rate,
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingTech(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience_years: 0,
      rating: 0,
      status: 'active',
      daily_rate: 0,
    });
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-red-100 text-red-700',
      on_leave: 'bg-yellow-100 text-yellow-700',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Nonaktif',
      on_leave: 'Cuti',
    };
    return textMap[status] || status;
  };

  if (!isAdmin) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👨‍🔧 Kelola Teknisi</h1>
          <p className="text-gray-500 mt-1">Data teknisi, spesialisasi, dan jadwal</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#00A6C4] text-white px-5 py-2 rounded-xl hover:bg-cyan-500 transition"
        >
          {showForm ? '✕ Tutup Form' : '+ Tambah Teknisi Baru'}
        </button>
      </div>

      {/* Form Tambah/Edit Teknisi */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
          <h2 className="font-bold text-lg mb-4">
            {editingTech ? '✏️ Edit Teknisi' : '✨ Tambah Teknisi Baru'}
          </h2>
          <form onSubmit={saveTechnician} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Nama Lengkap *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder="Nama teknisi"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Nomor Telepon *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder="0812-3456-7890"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Spesialisasi</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder="Cuci AC, Isi Freon, Perbaikan"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Pengalaman (tahun)</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 p-3"
                min="0"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Rating</label>
              <input
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 p-3"
                min="0"
                max="5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="on_leave">Cuti</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Biaya Harian (Rp)</label>
              <input
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder="150000"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-[#00A6C4] text-white px-6 py-2 rounded-xl hover:bg-cyan-500">
                {editingTech ? 'Update Teknisi' : 'Simpan Teknisi'}
              </button>
              <button type="button" onClick={resetForm} className="border border-gray-300 px-6 py-2 rounded-xl hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Teknisi */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A6C4]"></div>
        </div>
      ) : technicians.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">👨‍🔧</div>
          <p className="text-gray-500">Belum ada data teknisi</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-[#00A6C4] text-white px-4 py-2 rounded-xl"
          >
            + Tambah Teknisi Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((tech) => (
            <div key={tech.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0A2540] rounded-full flex items-center justify-center text-white text-xl">
                    👨‍🔧
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{tech.name}</h3>
                    <p className="text-sm text-gray-500">{tech.specialization || 'Umum'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tech.status)}`}>
                  {getStatusText(tech.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📞</span>
                  <span>{tech.phone}</span>
                </div>
                {tech.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">✉️</span>
                    <span className="text-xs">{tech.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⭐</span>
                  <span className="font-semibold">{tech.rating || 0}</span>
                  <span className="text-gray-400">/ 5.0</span>
                  <span className="text-gray-400 ml-2">•</span>
                  <span className="text-gray-400">📅 {tech.experience_years || 0} tahun</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">💰</span>
                  <span className="font-semibold text-green-600">Rp{tech.daily_rate?.toLocaleString()}</span>
                  <span className="text-gray-400">/ hari</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => editTechnician(tech)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteTechnician(tech.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-sm transition"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistik Teknisi */}
      {technicians.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#0A2540]">{technicians.length}</div>
            <div className="text-xs text-gray-500">Total Teknisi</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{technicians.filter(t => t.status === 'active').length}</div>
            <div className="text-xs text-gray-500">Aktif</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{technicians.filter(t => t.status === 'on_leave').length}</div>
            <div className="text-xs text-gray-500">Cuti</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#00A6C4]">
              Rp{technicians.reduce((sum, t) => sum + (t.daily_rate || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Total Biaya Harian</div>
          </div>
        </div>
      )}
    </div>
  );
}