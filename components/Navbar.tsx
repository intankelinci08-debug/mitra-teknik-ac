'use client';

import Link from 'next/link';
import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      }
      setLoading(false);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A2540] text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="hover:opacity-90 transition">
          <div><h1 className="text-2xl font-bold">Mitra Teknik</h1><p className="text-sm text-cyan-200">Engineering & AC Service</p></div>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-cyan-300">Home</Link>
          <Link href="/services" className="hover:text-cyan-300">Layanan</Link>
          <Link href="/booking" className="hover:text-cyan-300">Booking</Link>
          <Link href="/history" className="hover:text-cyan-300">Riwayat</Link>
          <Link href="/dashboard" className="hover:text-cyan-300">Dashboard</Link>
          {isAdmin && <Link href="/admin/dashboard" className="hover:text-cyan-300 font-bold text-yellow-300">⭐ Admin</Link>}
        </nav>
        {!loading && (user ? (
          <div className="flex items-center gap-4"><span className="text-sm text-cyan-200 hidden md:block">👋 {user.email?.split('@')[0]}</span><button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl font-semibold">Logout</button></div>
        ) : (
          <Link href="/login"><button className="bg-[#00A6C4] hover:bg-cyan-500 px-5 py-2 rounded-xl font-semibold">Login</button></Link>
        ))}
      </div>
    </header>
  );
}