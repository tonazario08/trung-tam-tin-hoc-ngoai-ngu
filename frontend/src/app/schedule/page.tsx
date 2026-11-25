'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, WEEKDAYS } from '@/lib/api';
import { Card } from '@/components/ui';
export default function SchedulePage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/classes/schedule/week').then(setRows).catch(() => {}); }, []);
  return <Layout><h1 className="text-2xl font-bold mb-4">Thời khóa biểu tuần</h1>
    <div className="grid md:grid-cols-7 gap-2">
      {[2,3,4,5,6,7,1].map(w => <Card key={w}><h2 className="font-bold mb-2">{WEEKDAYS[w]}</h2>
        {rows.filter(r => r.weekday === w).map((r: any, i: number) => <div key={i} className="text-xs py-1 border-b"><b>{r.startTime}-{r.endTime}</b><br />{r.classCode}<br />{r.courseName}<br />{r.teacherName} · {r.roomName}</div>)}
        {rows.filter(r => r.weekday === w).length === 0 && <p className="text-xs text-gray-400">Không có lớp</p>}
      </Card>)}
    </div>
  </Layout>;
}
