'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function AdminTestPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      
      // Cek user login
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Cek profile berdasarkan email
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single();
        setProfile(data);
      }
      
      setLoading(false);
    }
    check();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold">User Login:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold">Profile dari tabel profiles:</h2>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
      
      <div className="mt-4 p-4 rounded font-bold text-center">
        {profile?.role === 'admin' ? (
          <div className="bg-green-200 text-green-800 p-4 rounded">
            ✅ Anda adalah ADMIN! Akses ke /admin/dashboard seharusnya bisa.
          </div>
        ) : (
          <div className="bg-red-200 text-red-800 p-4 rounded">
            ❌ Anda BUKAN admin. Role saat ini: {profile?.role || 'Tidak ada'}
          </div>
        )}
      </div>
    </div>
  );
}