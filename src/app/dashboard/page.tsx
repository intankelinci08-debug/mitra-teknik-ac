'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>);
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#0A2540]">Dashboard</h1>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl">Logout</button>
          </div>
          <div className="border-t pt-6">
            <p className="text-gray-600">Selamat datang,</p>
            <p className="text-xl font-semibold text-[#0A2540]">{user?.email}</p>
          </div>
          <div className="mt-8 p-6 bg-[#0A2540] text-white rounded-2xl">
            <h2 className="text-xl font-bold mb-4">🎉 Login Berhasil!</h2>
            <p>Anda sekarang sudah login menggunakan email/password.</p>
            <p className="mt-2 text-sm opacity-80">Selanjutnya kita akan membuat form booking dan riwayat service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
