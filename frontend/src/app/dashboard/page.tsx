'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, fmtVND, WEEKDAYS } from '@/lib/api';
import { Card, Badge, statusColor } from '@/components/ui';
export default function DashboardPage() {
  const [d, setD] = useState<any>(null); const [err, setErr] = useState('');
  useEffect(() => { api('/dashboard/overview').then(setD).catch((e: any) => setErr(e.message)); }, []);
  if (err) return <Layout><p className="text-red-600">{err}</p></Layout>;
  if (!d) return <Layout><p>Đang tải...</p></Layout>;
  return <Layout>
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card><div className="text-sm text-gray-500">Học viên đang học</div><div className="text-3xl font-bold">{d.totalStudents}</div></Card>
      <Card><div className="text-sm text-gray-500">Lớp đang chạy</div><div className="text-3xl font-bold">{d.classesRunning}</div></Card>
      <Card><div className="text-sm text-gray-500">Doanh thu tháng này</div><div className="text-3xl font-bold text-green-700">{fmtVND(d.revenueThisMonth)}</div></Card>
      <Card><div className="text-sm text-gray-500">Học phí quá hạn</div><div className="text-3xl font-bold text-red-600">{d.overdueCount} hóa đơn</div><div className="text-sm">Còn nợ: {fmtVND(d.totalOutstanding)}</div></Card>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <Card><h2 className="font-bold mb-2">Lớp học hôm nay</h2>
        {d.todayClasses?.length === 0 && <p className="text-sm text-gray-500">Hôm nay không có lớp.</p>}
        {d.todayClasses?.map((c: any) => <div key={c.id} className="py-2 border-b text-sm"><b>{c.classCode}</b> — {c.courseName}<br />GV: {c.teacherName} · Phòng: {c.roomName} · {c.schedules.map((s: any) => `${WEEKDAYS[s.weekday]} ${s.startTime}-${s.endTime}`).join(', ')}</div>)}
      </Card>
      <Card><h2 className="font-bold mb-2">Học phí quá hạn</h2>
        {d.overdue?.length === 0 && <p className="text-sm text-gray-500">Không có hóa đơn quá hạn.</p>}
        {d.overdue?.map((i: any) => <div key={i.id} className="py-2 border-b text-sm flex justify-between"><span>{i.invoiceCode} — {i.student?.fullName}</span><Badge color={statusColor(i.status)}>{i.status} · {fmtVND(i.amountDue)}</Badge></div>)}
      </Card>
    </div>
  </Layout>;
}
