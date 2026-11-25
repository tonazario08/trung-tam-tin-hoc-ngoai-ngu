'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, fmtVND } from '@/lib/api';
import { Card, Btn, Input, Badge, statusColor } from '@/components/ui';
export default function TeachersPage() {
  const [list, setList] = useState<any[]>([]); const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', specialization: '', hourlyRate: 300000 });
  async function load() { const r = await api('/teachers?limit=20'); setList(r.data); }
  useEffect(() => { load(); }, []);
  async function add(e: any) { e.preventDefault(); try { await api('/teachers', { method: 'POST', body: JSON.stringify(form) }); setMsg('Đã thêm giáo viên (mật khẩu mặc định Teacher123!)'); load(); } catch (e: any) { setMsg(e.message); } }
  return <Layout><h1 className="text-2xl font-bold mb-4">Giáo viên</h1>{msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <Card className="mb-4"><h2 className="font-bold mb-2">Thêm giáo viên</h2><form onSubmit={add} className="grid md:grid-cols-3 gap-2">
      <Input placeholder="Họ tên *" required value={form.fullName} onChange={(e: any) => setForm({ ...form, fullName: e.target.value })} />
      <Input placeholder="Email *" required value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} />
      <Input placeholder="SĐT" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
      <Input placeholder="Chuyên môn (VD: Tiếng Anh)" value={form.specialization} onChange={(e: any) => setForm({ ...form, specialization: e.target.value })} />
      <Input type="number" placeholder="Lương/giờ" value={form.hourlyRate} onChange={(e: any) => setForm({ ...form, hourlyRate: Number(e.target.value) })} />
      <Btn type="submit">Thêm giáo viên</Btn></form></Card>
    <Card><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Họ tên</th><th>Email</th><th>Chuyên môn</th><th>Lương/giờ</th><th>Lớp đang dạy</th><th>Trạng thái</th></tr></thead>
      <tbody>{list.map((t: any) => <tr key={t.id} className="border-b"><td>{t.user?.fullName}</td><td>{t.user?.email}</td><td>{t.specialization}</td><td>{fmtVND(t.hourlyRate)}</td><td>{t.classes?.length || 0}</td><td><Badge color={statusColor(t.status)}>{t.status}</Badge></td></tr>)}</tbody></table></Card>
  </Layout>;
}
