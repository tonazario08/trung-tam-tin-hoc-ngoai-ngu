'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { Card, Btn, Input, Select } from '@/components/ui';
export default function AttendancePage() {
  const params = useParams(); const classId = params.classId as string;
  const [cls, setCls] = useState<any>(null); const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, string>>({}); const [msg, setMsg] = useState('');
  useEffect(() => { api(`/classes/${classId}`).then(setCls); }, []);
  async function save() {
    const items = (cls?.enrollments || []).filter((e: any) => e.status === 'ACTIVE').map((e: any) => ({ enrollmentId: e.id, status: marks[e.id] || 'PRESENT' }));
    try { const r = await api('/attendance/bulk', { method: 'POST', body: JSON.stringify({ classId, sessionDate: date, items }) }); setMsg(`Đã lưu điểm danh ${r.count} học viên ngày ${date}`); } catch (e: any) { setMsg(e.message); }
  }
  if (!cls) return <Layout><p>Đang tải...</p></Layout>;
  return <Layout><h1 className="text-2xl font-bold mb-2">Điểm danh — {cls.classCode}</h1>
    <p className="text-sm text-gray-500 mb-4">{cls.name}</p>
    <div className="flex gap-2 mb-4 items-center"><label className="text-sm">Ngày học</label><Input type="date" className="!w-48" value={date} onChange={(e: any) => setDate(e.target.value)} /><Btn onClick={save}>Lưu điểm danh</Btn></div>
    {msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <Card><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Mã</th><th>Họ tên</th><th>Trạng thái</th></tr></thead>
      <tbody>{cls.enrollments?.filter((e: any) => e.status === 'ACTIVE').map((e: any) => <tr key={e.id} className="border-b"><td>{e.student?.studentCode}</td><td>{e.student?.fullName}</td><td><Select value={marks[e.id] || 'PRESENT'} onChange={(ev: any) => setMarks({ ...marks, [e.id]: ev.target.value })} className="!w-40"><option>PRESENT</option><option>ABSENT</option><option>LATE</option><option>EXCUSED</option></Select></td></tr>)}</tbody></table></Card>
  </Layout>;
}
