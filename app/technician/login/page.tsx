'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TechnicianLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Cek apakah user terdaftar sebagai teknisi
      const { data: technician } = await supabase
        .from('technicians')
        .select('*')
        .eq('email', email)
        .single();

      if (technician) {
        router.push('/technician/dashboard');
      } else {
        setError('Akun tidak terdaftar sebagai teknisi');
        await supabase.auth.signOut();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0A2540]">Mitra Teknik</h1>
          <p className="text-gray-500 mt-2">Login Teknisi</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00A6C4] hover:bg-cyan-500 text-white py-4 rounded-2xl font-bold text-lg transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Login sebagai Teknisi'}
          </button>
        </form>
      </div>
    </div>
  );
}