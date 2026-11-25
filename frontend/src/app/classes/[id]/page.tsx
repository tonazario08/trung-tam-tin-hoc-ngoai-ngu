'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api, WEEKDAYS } from '@/lib/api';
import { Card, Btn, Input, Select, Badge, statusColor } from '@/components/ui';
export default function ClassDetailPage() {
  const params = useParams(); const id = params.id as string;
  const [cls, setCls] = useState<any>(null); const [students, setStudents] = useState<any[]>([]); const [msg, setMsg] = useState('');
  const [enroll, setEnroll] = useState({ studentId: '', discountPercent: 0 });
  const [sched, setSched] = useState({ weekday: 2, startTime: '18:00', endTime: '20:00', roomId: '' });
  async function load() { setCls(await api(`/classes/${id}`)); setStudents((await api('/students?limit=100')).data); }
  useEffect(() => { load(); }, []);
  async function doEnroll(e: any) { e.preventDefault(); try { const r = await api('/enrollments', { method: 'POST', body: JSON.stringify({ studentId: enroll.studentId, classId: id, discountPercent: enroll.discountPercent }) }); setMsg(`Ghi danh thành công, đã tạo hóa đơn ${r.invoice.invoiceCode} — ${Number(r.invoice.amountDue).toLocaleString('vi-VN')} đ`); load(); } catch (e: any) { setMsg(e.message); } }
  async function addSched(e: any) { e.preventDefault(); try { await api(`/classes/${id}/schedules`, { method: 'POST', body: JSON.stringify(sched) }); setMsg('Đã thêm lịch học'); load(); } catch (e: any) { setMsg(e.message); } }
  if (!cls) return <Layout><p>Đang tải...</p></Layout>;
  return <Layout>
    <h1 className="text-2xl font-bold">{cls.classCode} — {cls.name}</h1>
    <p className="text-sm text-gray-500 mb-4">{cls.course?.name} · GV: {cls.teacher?.user?.fullName} · Phòng: {cls.room?.name} · <Badge color={statusColor(cls.status)}>{cls.status}</Badge></p>
    {msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <Card><h2 className="font-bold mb-2">Ghi danh học viên</h2><form onSubmit={doEnroll} className="space-y-2">
        <Select value={enroll.studentId} onChange={(e: any) => setEnroll({ ...enroll, studentId: e.target.value })} required><option value="">-- Chọn học viên --</option>{students.map((s: any) => <option key={s.id} value={s.id}>{s.studentCode} — {s.fullName}</option>)}</Select>
        <Input type="number" placeholder="Giảm giá %" value={enroll.discountPercent} onChange={(e: any) => setEnroll({ ...enroll, discountPercent: Number(e.target.value) })} />
        <Btn type="submit">Ghi danh (tự tạo hóa đơn)</Btn></form>
        <Link href={`/attendance/${id}`} className="text-blue-600 text-sm inline-block mt-3">→ Điểm danh lớp này</Link>
      </Card>
      <Card><h2 className="font-bold mb-2">Thêm lịch học (kiểm tra trùng)</h2><form onSubmit={addSched} className="grid grid-cols-2 gap-2">
        <Select value={sched.weekday} onChange={(e: any) => setSched({ ...sched, weekday: Number(e.target.value) })}>{[1,2,3,4,5,6,7].map(w => <option key={w} value={w}>{WEEKDAYS[w]}</option>)}</Select>
        <Input type="time" value={sched.startTime} onChange={(e: any) => setSched({ ...sched, startTime: e.target.value })} />
        <Input type="time" value={sched.endTime} onChange={(e: any) => setSched({ ...sched, endTime: e.target.value })} />
        <Btn type="submit">Thêm lịch</Btn></form>
        <div className="mt-2 text-sm">{cls.schedules?.map((s: any) => <div key={s.id}>{WEEKDAYS[s.weekday]} {s.startTime}-{s.endTime}</div>)}</div>
      </Card>
    </div>
    <Card><h2 className="font-bold mb-2">Học viên trong lớp ({cls.enrollments?.length || 0})</h2>
      <table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Mã</th><th>Họ tên</th><th>SĐT</th><th>Trạng thái</th></tr></thead>
      <tbody>{cls.enrollments?.map((en: any) => <tr key={en.id} className="border-b"><td>{en.student?.studentCode}</td><td>{en.student?.fullName}</td><td>{en.student?.phone}</td><td><Badge color={statusColor(en.status)}>{en.status}</Badge></td></tr>)}</tbody></table></Card>
  </Layout>;
}
