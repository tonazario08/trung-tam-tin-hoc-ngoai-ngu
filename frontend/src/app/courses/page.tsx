'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, fmtVND } from '@/lib/api';
import { Card, Btn, Input, Select } from '@/components/ui';
export default function CoursesPage() {
  const [list, setList] = useState<any[]>([]); const [rooms, setRooms] = useState<any[]>([]); const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', category: 'ENGLISH', level: '', tuitionFee: 3500000, durationWeeks: 12, totalSessions: 24 });
  async function load() { setList((await api('/courses?limit=20')).data); setRooms(await api('/rooms')); }
  useEffect(() => { load(); }, []);
  async function add(e: any) { e.preventDefault(); try { await api('/courses', { method: 'POST', body: JSON.stringify(form) }); setMsg('Đã thêm khóa học'); load(); } catch (e: any) { setMsg(e.message); } }
  return <Layout><h1 className="text-2xl font-bold mb-4">Khóa học & Phòng học</h1>{msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <Card className="mb-4"><h2 className="font-bold mb-2">Thêm khóa học</h2><form onSubmit={add} className="grid md:grid-cols-3 gap-2">
      <Input placeholder="Tên khóa *" required value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
      <Select value={form.category} onChange={(e: any) => setForm({ ...form, category: e.target.value })}><option>ENGLISH</option><option>KOREAN</option><option>JAPANESE</option><option>IT</option></Select>
      <Input placeholder="Cấp độ (A1, Sơ cấp...)" value={form.level} onChange={(e: any) => setForm({ ...form, level: e.target.value })} />
      <Input type="number" placeholder="Học phí" value={form.tuitionFee} onChange={(e: any) => setForm({ ...form, tuitionFee: Number(e.target.value) })} />
      <Input type="number" placeholder="Số tuần" value={form.durationWeeks} onChange={(e: any) => setForm({ ...form, durationWeeks: Number(e.target.value) })} />
      <Btn type="submit">Thêm khóa học</Btn></form></Card>
    <div className="grid md:grid-cols-2 gap-4">
      <Card><h2 className="font-bold mb-2">Danh sách khóa học</h2>{list.map((c: any) => <div key={c.id} className="py-2 border-b text-sm flex justify-between"><span><b>{c.name}</b> ({c.category} - {c.level})</span><span>{fmtVND(c.tuitionFee)}</span></div>)}</Card>
      <Card><h2 className="font-bold mb-2">Phòng học</h2>{rooms.map((r: any) => <div key={r.id} className="py-2 border-b text-sm">{r.name} — sức chứa {r.capacity} — {r.location}</div>)}</Card>
    </div>
  </Layout>;
}
