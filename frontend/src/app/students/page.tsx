'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, getToken } from '@/lib/api';
import { Card, Btn, Input, Select, Badge, statusColor } from '@/components/ui';
// Upload 1 file qua POST /uploads (dung fetch + FormData vi api() chi gui JSON).
async function uploadFile(file: File) {
  const fd = new FormData(); fd.append('file', file);
  const token = getToken();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Loi ${res.status}`);
  return data; // { url, filename, originalName, size }
}
export default function StudentsPage() {
  const [list, setList] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', parentName: '', parentPhone: '' });
  const [csv, setCsv] = useState(''); const [msg, setMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null); const [uploading, setUploading] = useState(false);
  async function load() { try { const r = await api(`/students?search=${encodeURIComponent(search)}&status=${status}&limit=20`); setList(r.data); setTotal(r.total); } catch (e: any) { setMsg(e.message); } }
  useEffect(() => { load(); }, []);
  async function add(e: any) {
    e.preventDefault();
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) { setUploading(true); const r = await uploadFile(avatarFile); avatarUrl = r.url; }
      await api('/students', { method: 'POST', body: JSON.stringify({ ...form, avatarUrl }) });
      setMsg('Đã thêm học viên'); setForm({ fullName: '', phone: '', email: '', parentName: '', parentPhone: '' }); setAvatarFile(null); load();
    } catch (e: any) { setMsg(e.message); } finally { setUploading(false); }
  }
  async function importCsv() { try { const r = await api('/students/import-csv', { method: 'POST', body: JSON.stringify({ csv }) }); setMsg(`Đã import ${r.imported} học viên`); load(); } catch (e: any) { setMsg(e.message); } }
  return <Layout>
    <h1 className="text-2xl font-bold mb-4">Học viên ({total})</h1>
    <div className="flex gap-2 mb-4"><Input placeholder="Tìm theo tên, mã, SĐT..." value={search} onChange={(e: any) => setSearch(e.target.value)} /><Select value={status} onChange={(e: any) => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option><option>STUDYING</option><option>RESERVED</option><option>DROPPED</option></Select><Btn onClick={load}>Tìm</Btn></div>
    {msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <Card><h2 className="font-bold mb-2">Thêm học viên</h2><form onSubmit={add} className="space-y-2">
        <Input placeholder="Họ tên *" required value={form.fullName} onChange={(e: any) => setForm({ ...form, fullName: e.target.value })} />
        <Input placeholder="SĐT" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Tên phụ huynh" value={form.parentName} onChange={(e: any) => setForm({ ...form, parentName: e.target.value })} />
        <Input placeholder="SĐT phụ huynh" value={form.parentPhone} onChange={(e: any) => setForm({ ...form, parentPhone: e.target.value })} />
        <div><label className="text-xs text-gray-500">Ảnh đại diện</label><input type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm mt-1" onChange={(e: any) => setAvatarFile(e.target.files?.[0] || null)} />{avatarFile && <p className="text-xs text-gray-500 mt-1">Đã chọn: {avatarFile.name}</p>}</div>
        <Btn type="submit" >{uploading ? 'Đang tải ảnh...' : 'Thêm học viên'}</Btn></form></Card>
      <Card><h2 className="font-bold mb-2">Import CSV mẫu</h2><p className="text-xs text-gray-500 mb-2">Mỗi dòng: Họ tên,SĐT,Email,Tên phụ huynh,SĐT phụ huynh</p>
        <textarea className="w-full rounded-lg border p-2 text-sm h-24" value={csv} onChange={(e: any) => setCsv(e.target.value)} placeholder={'Nguyễn Văn A,0901234567,a@example.com,Nguyễn Văn B,0911234567'} />
        <Btn onClick={importCsv} className="mt-2">Import</Btn></Card>
    </div>
    <Card><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Mã</th><th>Họ tên</th><th>SĐT</th><th>Phụ huynh</th><th>Trạng thái</th></tr></thead>
      <tbody>{list.map((s: any) => <tr key={s.id} className="border-b"><td>{s.studentCode}</td><td>{s.fullName}</td><td>{s.phone}</td><td>{s.parentName || ''}</td><td><Badge color={statusColor(s.status)}>{s.status}</Badge></td></tr>)}</tbody></table></Card>
  </Layout>;
}
