'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, getUser, logout } from '@/lib/api';
const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/students', label: 'Học viên' },
  { href: '/teachers', label: 'Giáo viên' },
  { href: '/courses', label: 'Khóa học' },
  { href: '/classes', label: 'Lớp học' },
  { href: '/schedule', label: 'Thời khóa biểu' },
  { href: '/tuition', label: 'Học phí' },
  { href: '/grades', label: 'Điểm' },
  { href: '/leads', label: 'Tư vấn (Leads)' },
  { href: '/certificates', label: 'Chứng chỉ' },
  { href: '/notifications', label: 'Thông báo' },
];
export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  useEffect(() => { const u = getUser(); if (!u) { window.location.href = '/login'; } else { setUser(u); api('/notifications/unread-count').then((r: any) => setUnread(r.unreadCount || 0)).catch(() => {}); } }, []);
  if (!user) return <div className="p-8 text-sm text-gray-500">Đang kiểm tra đăng nhập...</div>;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 bg-slate-900 text-white p-4 flex flex-col gap-1">
        <div className="mb-4"><div className="text-lg font-bold">Trung tâm TH - NN</div><div className="text-xs text-slate-400">Quản lý trung tâm tin học - ngoại ngữ</div></div>
        {NAV.map(n => <Link key={n.href} href={n.href} className={`rounded-lg px-3 py-2 text-sm flex justify-between ${pathname === n.href || pathname.startsWith(n.href + '/') ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><span>{n.label}</span>{n.href === '/notifications' && unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>}</Link>)}
        <div className="mt-auto pt-4 border-t border-slate-700 text-sm">
          <div>{user.fullName} ({user.role})</div>
          <button onClick={logout} className="mt-2 text-red-300 hover:text-red-200 text-sm">Đăng xuất</button>
        </div>
      </aside>
      <main className="flex-1 p-6 max-w-6xl">{children}</main>
    </div>
  );
}
