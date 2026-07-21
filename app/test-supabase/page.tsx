'use client';

import { createClient } from '@/src/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function TestSupabasePage() {
  const [status, setStatus] = useState('Loading...');
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    // Cek environment variables
    setUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || 'TIDAK DITEMUKAN');
    setKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'TIDAK DITEMUKAN');
    
    async function testConnection() {
      try {
        const supabase = createClient();
        console.log('Supabase client created');
        
        // Test query sederhana
        const { data, error } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        
        if (error) {
          setStatus('❌ Error: ' + error.message);
        } else {
          setStatus('✅ Koneksi Supabase BERHASIL!');
        }
      } catch (err: any) {
        setStatus('❌ Gagal: ' + err.message);
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Koneksi Supabase</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p><strong>URL:</strong> {url}</p>
        <p><strong>Key:</strong> {key ? key.substring(0, 30) + '...' : 'TIDAK ADA'}</p>
      </div>
      
      <div className={`p-4 rounded ${status.includes('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
        <p><strong>Status:</strong> {status}</p>
      </div>
    </div>
  );
}