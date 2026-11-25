'use client';
import { useState } from 'react';
import { login } from '@/lib/api';
import { Card, Btn, Input } from '@/components/ui';
export default function LoginPage() {
  const [email, setEmail] = useState('admin@trungtam.vn');
  const [password, setPassword] = useState('Admin123!');
  const [err, setErr] = useState('');
  async function submit(e: any) { e.preventDefault(); setErr(''); try { await login(email, password); window.location.href = '/dashboard'; } catch (e: any) { setErr(e.message); } }
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-bold mb-1">Đăng nhập</h1>
      <p className="text-sm text-gray-500 mb-4">Trung tâm Tin học - Ngoại ngữ</p>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="text-sm">Email</label><Input value={email} onChange={(e: any) => setEmail(e.target.value)} /></div>
        <div><label className="text-sm">Mật khẩu</label><Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} /></div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Btn type="submit" className="w-full">Đăng nhập</Btn>
      </form>
      <p className="text-xs text-gray-500 mt-4">Tài khoản demo: admin@trungtam.vn / Admin123! — Giáo vụ: giaovu@trungtam.vn / Admin123! — Giáo viên: mai@trungtam.vn / Teacher123!</p>
    </Card>
  </div>;
}
