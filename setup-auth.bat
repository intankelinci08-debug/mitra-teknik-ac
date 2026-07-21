@echo off
echo Membuat struktur folder auth...

:: Buat folder
mkdir src\app\login 2>nul
mkdir src\app\register 2>nul
mkdir src\app\dashboard 2>nul

:: Buat file login page
(
echo 'use client';
echo.
echo import { createClient } from '@/lib/supabase/client';
echo import { useState } from 'react';
echo import { useRouter } from 'next/navigation';
echo import Link from 'next/link';
echo.
echo export default function LoginPage^(^) {
echo   const [email, setEmail] = useState^(''^);
echo   const [password, setPassword] = useState^(''^);
echo   const [error, setError] = useState^(''^);
echo   const [loading, setLoading] = useState^(false^);
echo   const router = useRouter^(^);
echo   const supabase = createClient^(^);
echo.
echo   const handleLogin = async (e: React.FormEvent^) ^{
echo     e.preventDefault^(^);
echo     setLoading^(true^);
echo     setError^(''^);
echo.
echo     const { error } = await supabase.auth.signInWithPassword^({ email, password }^);
echo.
echo     if (error^) ^{
echo       setError^(error.message^);
echo     ^} else ^{
echo       router.push^('/dashboard'^);
echo     ^}
echo     setLoading^(false^);
echo   ^};
echo.
echo   return ^(
echo     ^<div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-6"^>
echo       ^<div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl"^>
echo         ^<div className="text-center mb-8"^>
echo           ^<h1 className="text-3xl font-bold text-[#0A2540]"^>Mitra Teknik^</h1^>
echo           ^<p className="text-gray-500 mt-2"^>Login ke akun Anda^</p^>
echo         ^</div^>
echo         {error ^&^& ^(
echo           ^<div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm"^>{error}^</div^>
echo         ^)}
echo         ^<form onSubmit={handleLogin} className="space-y-5"^>
echo           ^<div^>
echo             ^<label className="block text-sm font-semibold mb-2"^>Email^</label^>
echo             ^<input
echo               type="email"
echo               value={email}
echo               onChange={(e^) =^> setEmail(e.target.value^)}
echo               className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
echo               placeholder="email@example.com"
echo               required
echo             /^>
echo           ^</div^>
echo           ^<div^>
echo             ^<label className="block text-sm font-semibold mb-2"^>Password^</label^>
echo             ^<input
echo               type="password"
echo               value={password}
echo               onChange={(e^) =^> setPassword(e.target.value^)}
echo               className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
echo               placeholder="••••••••"
echo               required
echo             /^>
echo           ^</div^>
echo           ^<button
echo             type="submit"
echo             disabled={loading}
echo             className="w-full bg-[#00A6C4] hover:bg-cyan-500 text-white py-4 rounded-2xl font-bold text-lg transition disabled:opacity-50"
echo           ^>
echo             {loading ? 'Memproses...' : 'Login'}
echo           ^</button^>
echo         ^</form^>
echo         ^<p className="text-center text-gray-500 mt-6"^>
echo           Belum punya akun? ^<Link href="/register" className="text-[#00A6C4] font-semibold hover:underline"^>Daftar^</Link^>
echo         ^</p^>
echo       ^</div^>
echo     ^</div^>
echo   ^);
echo }
) > src\app\login\page.tsx

echo File login page.tsx telah dibuat.

:: Buat file register page
(
echo 'use client';
echo.
echo import { createClient } from '@/lib/supabase/client';
echo import { useState } from 'react';
echo import { useRouter } from 'next/navigation';
echo import Link from 'next/link';
echo.
echo export default function RegisterPage^(^) {
echo   const [email, setEmail] = useState^(''^);
echo   const [password, setPassword] = useState^(''^);
echo   const [confirmPassword, setConfirmPassword] = useState^(''^);
echo   const [error, setError] = useState^(''^);
echo   const [loading, setLoading] = useState^(false^);
echo   const router = useRouter^(^);
echo   const supabase = createClient^(^);
echo.
echo   const handleRegister = async (e: React.FormEvent^) ^{
echo     e.preventDefault^(^);
echo     setLoading^(true^);
echo     setError^(''^);
echo.
echo     if (password !== confirmPassword^) ^{
echo       setError^('Password tidak cocok'^);
echo       setLoading^(false^);
echo       return;
echo     ^}
echo.
echo     const { error } = await supabase.auth.signUp^({ email, password }^);
echo.
echo     if (error^) ^{
echo       setError^(error.message^);
echo     ^} else ^{
echo       alert^('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.'^);
echo       router.push^('/login'^);
echo     ^}
echo     setLoading^(false^);
echo   ^};
echo.
echo   return ^(
echo     ^<div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-6"^>
echo       ^<div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl"^>
echo         ^<div className="text-center mb-8"^>
echo           ^<h1 className="text-3xl font-bold text-[#0A2540]"^>Mitra Teknik^</h1^>
echo           ^<p className="text-gray-500 mt-2"^>Daftar akun baru^</p^>
echo         ^</div^>
echo         {error ^&^& ^(
echo           ^<div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm"^>{error}^</div^>
echo         ^)}
echo         ^<form onSubmit={handleRegister} className="space-y-5"^>
echo           ^<div^>
echo             ^<label className="block text-sm font-semibold mb-2"^>Email^</label^>
echo             ^<input
echo               type="email"
echo               value={email}
echo               onChange={(e^) =^> setEmail(e.target.value^)}
echo               className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
echo               placeholder="email@example.com"
echo               required
echo             /^>
echo           ^</div^>
echo           ^<div^>
echo             ^<label className="block text-sm font-semibold mb-2"^>Password^</label^>
echo             ^<input
echo               type="password"
echo               value={password}
echo               onChange={(e^) =^> setPassword(e.target.value^)}
echo               className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
echo               placeholder="••••••••"
echo               required
echo             /^>
echo           ^</div^>
echo           ^<div^>
echo             ^<label className="block text-sm font-semibold mb-2"^>Konfirmasi Password^</label^>
echo             ^<input
echo               type="password"
echo               value={confirmPassword}
echo               onChange={(e^) =^> setConfirmPassword(e.target.value^)}
echo               className="w-full rounded-2xl border border-gray-200 p-4 bg-gray-50"
echo               placeholder="••••••••"
echo               required
echo             /^>
echo           ^</div^>
echo           ^<button
echo             type="submit"
echo             disabled={loading}
echo             className="w-full bg-[#00A6C4] hover:bg-cyan-500 text-white py-4 rounded-2xl font-bold text-lg transition disabled:opacity-50"
echo           ^>
echo             {loading ? 'Memproses...' : 'Daftar'}
echo           ^</button^>
echo         ^</form^>
echo         ^<p className="text-center text-gray-500 mt-6"^>
echo           Sudah punya akun? ^<Link href="/login" className="text-[#00A6C4] font-semibold hover:underline"^>Login^</Link^>
echo         ^</p^>
echo       ^</div^>
echo     ^</div^>
echo   ^);
echo }
) > src\app\register\page.tsx

echo File register page.tsx telah dibuat.

:: Buat file dashboard page
(
echo 'use client';
echo.
echo import { createClient } from '@/lib/supabase/client';
echo import { useEffect, useState } from 'react';
echo import { useRouter } from 'next/navigation';
echo.
echo export default function DashboardPage^(^) {
echo   const [user, setUser] = useState^(null^);
echo   const [loading, setLoading] = useState^(true^);
echo   const router = useRouter^(^);
echo   const supabase = createClient^(^);
echo.
echo   useEffect^(^(^) =^> ^{
echo     async function getUser^(^) ^{
echo       const { data: { user } } = await supabase.auth.getUser^(^);
echo       if ^(!user^) ^{
echo         router.push^('/login'^);
echo       ^} else ^{
echo         setUser^(user^);
echo       ^}
echo       setLoading^(false^);
echo     ^}
echo     getUser^(^);
echo   ^}, [^]^);
echo.
echo   const handleLogout = async ^(^) =^> ^{
echo     await supabase.auth.signOut^(^);
echo     router.push^('/login'^);
echo   ^};
echo.
echo   if ^(loading^) ^{
echo     return ^(^<div className="min-h-screen flex items-center justify-center"^>^<p^>Loading...^</p^>^</div^>^);
echo   ^}
echo.
echo   return ^(
echo     ^<div className="min-h-screen bg-[#F3F4F6] p-6"^>
echo       ^<div className="max-w-4xl mx-auto"^>
echo         ^<div className="bg-white rounded-3xl p-8 shadow-xl"^>
echo           ^<div className="flex justify-between items-center mb-6"^>
echo             ^<h1 className="text-3xl font-bold text-[#0A2540]"^>Dashboard^</h1^>
echo             ^<button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"^>Logout^</button^>
echo           ^</div^>
echo           ^<div className="border-t pt-6"^>
echo             ^<p className="text-gray-600"^>Selamat datang,^</p^>
echo             ^<p className="text-xl font-semibold text-[#0A2540]"^>{user?.email}^</p^>
echo           ^</div^>
echo           ^<div className="mt-8 p-6 bg-[#0A2540] text-white rounded-2xl"^>
echo             ^<h2 className="text-xl font-bold mb-4"^>🎉 Login Berhasil!^</h2^>
echo             ^<p^>Anda sekarang sudah login menggunakan email/password.^</p^>
echo             ^<p className="mt-2 text-sm opacity-80"^>Selanjutnya kita akan membuat form booking dan riwayat service.^</p^>
echo           ^</div^>
echo         ^</div^>
echo       ^</div^>
echo     ^</div^>
echo   ^);
echo }
) > src\app\dashboard\page.tsx

echo File dashboard page.tsx telah dibuat.

echo.
echo ========================================
echo Selesai! Struktur auth telah dibuat.
echo Sekarang edit file .env.local dulu
echo sebelum menjalankan npm run dev.
echo ========================================