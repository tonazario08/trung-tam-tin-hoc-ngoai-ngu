import React from 'react';
export function Card({ children, className = '' }: any) { return <div className={`rounded-xl border bg-white p-4 shadow-sm ${className}`}>{children}</div>; }
export function Btn({ children, onClick, type = 'button', variant = 'primary', className = '' }: any) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50';
  const v = variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-gray-300 bg-white hover:bg-gray-50';
  return <button type={type} onClick={onClick} className={`${base} ${v} ${className}`}>{children}</button>;
}
export function Input(props: any) { return <input {...props} className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 ${props.className || ''}`} />; }
export function Select(props: any) { return <select {...props} className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white ${props.className || ''}`} />; }
export function Badge({ children, color = 'gray' }: any) {
  const map: any = { gray: 'bg-gray-100 text-gray-700', green: 'bg-green-100 text-green-700', red: 'bg-red-100 text-red-700', yellow: 'bg-yellow-100 text-yellow-800', blue: 'bg-blue-100 text-blue-700' };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[color] || map.gray}`}>{children}</span>;
}
export function statusColor(s: string) { return { PAID: 'green', PARTIAL: 'yellow', UNPAID: 'gray', OVERDUE: 'red', ACTIVE: 'green', STUDYING: 'green', RUNNING: 'green', OPEN: 'blue', PRESENT: 'green', ABSENT: 'red', LATE: 'yellow', EXCUSED: 'blue', DROPPED: 'red', FINISHED: 'gray', COMPLETED: 'green' }[s] || 'gray'; }
