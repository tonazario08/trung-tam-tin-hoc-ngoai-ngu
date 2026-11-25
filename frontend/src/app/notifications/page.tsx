'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api } from '@/lib/api';
import { Card, Btn, Badge } from '@/components/ui';
export default function NotificationsPage() {
  const [list, setList] = useState<any[]>([]); const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0); const [msg, setMsg] = useState('');
  async function load() {
    try {
      const r = await api('/notifications?limit=20');
      setList(r.data || []); setTotal(r.total || 0);
      const c = await api('/notifications/unread-count');
      setUnread(c.unreadCount || 0);
    } catch (e: any) { setMsg(e.message); }
  }
  useEffect(() => { load(); }, []);
  async function markRead(id: string) { try { await api(`/notifications/${id}/read`, { method: 'PATCH' }); load(); } catch (e: any) { setMsg(e.message); } }
  async function markAllRead() { try { await api('/notifications/read-all', { method: 'PATCH' }); setMsg('Đã đánh dấu tất cả là đã đọc'); load(); } catch (e: any) { setMsg(e.message); } }
  return <Layout>
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">Thông báo ({total})</h1>
      <Btn onClick={markAllRead}>Đọc tất cả</Btn>
    </div>
    {msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <p className="text-sm text-gray-500 mb-3">Bạn có {unread} thông báo chưa đọc.</p>
    <Card><ul className="divide-y">
      {list.map((n: any) => <li key={n.id} className="py-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">{n.title} {!n.isRead && <Badge color="red">Chưa đọc</Badge>}</p>
          <p className="text-sm text-gray-600">{n.message}</p>
          <p className="text-xs text-gray-400 mt-1">{n.type} • {n.createdAt?.slice(0, 19).replace('T', ' ')}</p>
        </div>
        {!n.isRead && <Btn onClick={() => markRead(n.id)} className="!px-2 !py-1 text-xs shrink-0">Đánh dấu đã đọc</Btn>}
      </li>)}
      {list.length === 0 && <li className="py-4 text-sm text-gray-500">Chưa có thông báo nào.</li>}
    </ul></Card>
  </Layout>;
}
