'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api, WEEKDAYS } from '@/lib/api';
import { Card, Btn, Input, Select, Badge, statusColor } from '@/components/ui';
export default function ClassesPage() {
  const [list, setList] = useState<any[]>([]); const [courses, setCourses] = useState<any[]>([]); const [teachers, setTeachers] = useState<any[]>([]); const [rooms, setRooms] = useState<any[]>([]); const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', courseId: '', teacherId: '', roomId: '', maxStudents: 25, startDate: '' });
  async function load() { setList((await api('/classes?limit=20')).data); setCourses((await api('/courses?limit=50')).data); setTeachers((await api('/teachers?limit=50')).data); setRooms(await api('/rooms')); }
  useEffect(() => { load(); }, []);
  async function add(e: any) { e.preventDefault(); try { await api('/classes', { method: 'POST', body: JSON.stringify(form) }); setMsg('Đã mở lớp'); load(); } catch (e: any) { setMsg(e.message); } }
  return <Layout><h1 className="text-2xl font-bold mb-4">Lớp học</h1>{msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <Card className="mb-4"><h2 className="font-bold mb-2">Mở lớp mới</h2><form onSubmit={add} className="grid md:grid-cols-3 gap-2">
      <Input placeholder="Tên lớp *" required value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
      <Select value={form.courseId} onChange={(e: any) => setForm({ ...form, courseId: e.target.value })} required><option value="">-- Khóa học --</option>{courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
      <Select value={form.teacherId} onChange={(e: any) => setForm({ ...form, teacherId: e.target.value })}><option value="">-- Giáo viên --</option>{teachers.map((t: any) => <option key={t.id} value={t.id}>{t.user?.fullName} ({t.specialization})</option>)}</Select>
      <Select value={form.roomId} onChange={(e: any) => setForm({ ...form, roomId: e.target.value })}><option value="">-- Phòng --</option>{rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select>
      <Input type="number" value={form.maxStudents} onChange={(e: any) => setForm({ ...form, maxStudents: Number(e.target.value) })} />
      <Input type="date" value={form.startDate} onChange={(e: any) => setForm({ ...form, startDate: e.target.value })} />
      <Btn type="submit">Mở lớp</Btn></form></Card>
    <Card><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Mã lớp</th><th>Tên lớp</th><th>Khóa học</th><th>Giáo viên</th><th>Sĩ số</th><th>Lịch</th><th>Trạng thái</th><th></th></tr></thead>
      <tbody>{list.map((c: any) => <tr key={c.id} className="border-b"><td>{c.classCode}</td><td>{c.name}</td><td>{c.course?.name}</td><td>{c.teacher?.user?.fullName || ''}</td><td>{c.activeEnrollments}/{c.maxStudents}</td><td>{c.schedules?.map((s: any) => `${WEEKDAYS[s.weekday]} ${s.startTime}-${s.endTime}`).join(', ')}</td><td><Badge color={statusColor(c.status)}>{c.status}</Badge></td><td><Link className="text-blue-600" href={`/classes/${c.id}`}>Chi tiết</Link></td></tr>)}</tbody></table></Card>
  </Layout>;
}
