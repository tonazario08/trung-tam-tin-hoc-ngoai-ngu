'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { Card, Btn, Input, Select, Badge, statusColor } from '@/components/ui';
const LEAD_STATUSES = ['NEW', 'CONTACTED', 'ENROLLED', 'LOST'];
const LEAD_COLORS: Record<string, string> = { NEW: 'blue', CONTACTED: 'yellow', ENROLLED: 'green', LOST: 'red' };
export default function LeadsPage() {
  const [list, setList] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
  const [form, setForm] = useState({ fullName: '', phone: '', interestedCourseId: '', source: '' });
  const [msg, setMsg] = useState('');
  async function load() { try { const r = await api(`/leads?search=${encodeURIComponent(search)}&status=${status}&limit=20`); setList(r.data); setTotal(r.total); } catch (e: any) { setMsg(e.message); } }
  async function loadCourses() { try { setCourses((await api('/courses?limit=50')).data); } catch { /* khoa hoc tuy chon */ } }
  useEffect(() => { load(); loadCourses(); }, []);
  async function add(e: any) { e.preventDefault(); try { await api('/leads', { method: 'POST', body: JSON.stringify(form) }); setMsg('Đã thêm lead'); setForm({ fullName: '', phone: '', interestedCourseId: '', source: '' }); load(); } catch (e: any) { setMsg(e.message); } }
  async function changeStatus(lead: any, newStatus: string) { try { await api(`/leads/${lead.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) }); setMsg(`Đã đổi trạng thái ${lead.fullName} → ${newStatus}`); load(); } catch (e: any) { setMsg(e.message); } }
  async function convert(lead: any) { try { const r = await api(`/leads/${lead.id}/convert`, { method: 'POST' }); setMsg(`Đã chuyển ${lead.fullName} thành học viên — mã học viên mới: ${r.student.studentCode}`); load(); } catch (e: any) { setMsg(e.message); } }
  async function remove(lead: any) { if (!confirm(`Xóa lead ${lead.fullName}?`)) return; try { await api(`/leads/${lead.id}`, { method: 'DELETE' }); setMsg('Đã xóa lead'); load(); } catch (e: any) { setMsg(e.message); } }
  return <Layout>
    <h1 className="text-2xl font-bold mb-4">Leads ({total})</h1>
    <div className="flex gap-2 mb-4"><Input placeholder="Tìm theo tên, SĐT..." value={search} onChange={(e: any) => setSearch(e.target.value)} /><Select value={status} onChange={(e: any) => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select><Btn onClick={load}>Tìm</Btn></div>
    {msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <Card><h2 className="font-bold mb-2">Thêm lead</h2><form onSubmit={add} className="grid md:grid-cols-2 gap-2">
      <Input placeholder="Họ tên *" required value={form.fullName} onChange={(e: any) => setForm({ ...form, fullName: e.target.value })} />
      <Input placeholder="SĐT *" required value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} />
      <Select value={form.interestedCourseId} onChange={(e: any) => setForm({ ...form, interestedCourseId: e.target.value })}><option value="">Khóa học quan tâm</option>{courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
      <Input placeholder="Nguồn (Facebook, giới thiệu...)" value={form.source} onChange={(e: any) => setForm({ ...form, source: e.target.value })} />
      <Btn type="submit">Thêm lead</Btn></form></Card>
    <Card className="mt-4"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Họ tên</th><th>SĐT</th><th>Khóa quan tâm</th><th>Nguồn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>{list.map((l: any) => <tr key={l.id} className="border-b"><td>{l.fullName}</td><td>{l.phone}</td><td>{l.interestedCourse?.name || ''}</td><td>{l.source || ''}</td>
        <td><Badge color={LEAD_COLORS[l.status] || statusColor(l.status)}>{l.status}</Badge>
          <Select value={l.status} onChange={(e: any) => changeStatus(l, e.target.value)} className="mt-1 !w-auto"><option value="">Đổi trạng thái</option>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></td>
        <td className="space-x-2"><Btn variant="secondary" onClick={() => convert(l)} disabled={l.status === 'ENROLLED'}>Chuyển thành học viên</Btn><Btn variant="danger" onClick={() => remove(l)}>Xóa</Btn></td></tr>)}</tbody></table></Card>
  </Layout>;
}
