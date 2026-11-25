'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { Card, Btn, Input, Select } from '@/components/ui';
export default function GradesPage() {
  const [list, setList] = useState<any[]>([]); const [enrollments, setEnrollments] = useState<any[]>([]); const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ enrollmentId: '', type: 'FINAL', score: 8, comment: '' });
  async function load() { setList(await api('/grades?limit=50')); setEnrollments(await api('/enrollments?status=ACTIVE')); }
  useEffect(() => { load(); }, []);
  async function add(e: any) { e.preventDefault(); try { await api('/grades', { method: 'POST', body: JSON.stringify(form) }); setMsg('Đã nhập điểm (0-10)'); load(); } catch (e: any) { setMsg(e.message); } }
  return <Layout><h1 className="text-2xl font-bold mb-4">Điểm</h1>{msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <Card className="mb-4"><h2 className="font-bold mb-2">Nhập điểm</h2><form onSubmit={add} className="grid md:grid-cols-4 gap-2">
      <Select value={form.enrollmentId} onChange={(e: any) => setForm({ ...form, enrollmentId: e.target.value })} required><option value="">-- Học viên / Lớp --</option>{enrollments.map((en: any) => <option key={en.id} value={en.id}>{en.student?.fullName} — {en.class?.classCode}</option>)}</Select>
      <Select value={form.type} onChange={(e: any) => setForm({ ...form, type: e.target.value })}><option>MIDTERM</option><option>FINAL</option><option>ASSIGNMENT</option></Select>
      <Input type="number" step="0.5" min="0" max="10" value={form.score} onChange={(e: any) => setForm({ ...form, score: Number(e.target.value) })} />
      <Btn type="submit">Lưu điểm</Btn></form></Card>
    <Card><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Học viên</th><th>Lớp</th><th>Loại</th><th>Điểm</th><th>Nhận xét</th></tr></thead>
      <tbody>{list.map((g: any) => <tr key={g.id} className="border-b"><td>{g.enrollment?.student?.fullName}</td><td>{g.enrollment?.class?.classCode}</td><td>{g.type}</td><td>{Number(g.score)}</td><td>{g.comment || ''}</td></tr>)}</tbody></table></Card>
  </Layout>;
}
