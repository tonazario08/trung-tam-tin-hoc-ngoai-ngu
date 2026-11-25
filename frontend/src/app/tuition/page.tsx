'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, fmtVND, getToken } from '@/lib/api';
import { Card, Btn, Input, Select, Badge, statusColor } from '@/components/ui';
// Upload 1 file qua POST /uploads (dung fetch + FormData vi api() chi gui JSON).
async function uploadFile(file: File) {
  const fd = new FormData(); fd.append('file', file);
  const token = getToken();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Loi ${res.status}`);
  return data; // { url, filename, originalName, size }
}
export default function TuitionPage() {
  const [list, setList] = useState<any[]>([]); const [status, setStatus] = useState(''); const [msg, setMsg] = useState('');
  const [pay, setPay] = useState({ invoiceId: '', amount: 1000000, method: 'QR' });
  const [proofFile, setProofFile] = useState<File | null>(null); const [uploading, setUploading] = useState(false);
  async function load() { const r = await api(`/invoices?status=${status}&limit=20`); setList(r.data); }
  useEffect(() => { load(); }, []);
  async function doPay(e: any) {
    e.preventDefault();
    try {
      let proofUrl: string | undefined;
      if (proofFile) { setUploading(true); const r = await uploadFile(proofFile); proofUrl = r.url; }
      const r = await api(`/invoices/${pay.invoiceId}/payments`, { method: 'POST', body: JSON.stringify({ amount: pay.amount, method: pay.method, proofUrl }) });
      setMsg(`Đã thu ${fmtVND(pay.amount)} — hóa đơn ${r.invoice.invoiceCode} còn nợ ${fmtVND(r.invoice.amountDue)} (${r.invoice.status})`); setProofFile(null); load();
    } catch (e: any) { setMsg(e.message); } finally { setUploading(false); }
  }
  return <Layout><h1 className="text-2xl font-bold mb-4">Học phí</h1>
    <div className="flex gap-2 mb-4"><Select value={status} onChange={(e: any) => setStatus(e.target.value)} className="!w-48"><option value="">Tất cả</option><option>UNPAID</option><option>PARTIAL</option><option>PAID</option><option>OVERDUE</option></Select><Btn onClick={load}>Lọc</Btn></div>
    {msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <Card className="mb-4"><h2 className="font-bold mb-2">Thu tiền</h2><form onSubmit={doPay} className="grid md:grid-cols-4 gap-2">
      <Select value={pay.invoiceId} onChange={(e: any) => setPay({ ...pay, invoiceId: e.target.value })} required><option value="">-- Chọn hóa đơn --</option>{list.map((i: any) => <option key={i.id} value={i.id}>{i.invoiceCode} — {i.student?.fullName} — còn {fmtVND(i.amountDue)}</option>)}</Select>
      <Input type="number" value={pay.amount} onChange={(e: any) => setPay({ ...pay, amount: Number(e.target.value) })} />
      <Select value={pay.method} onChange={(e: any) => setPay({ ...pay, method: e.target.value })}><option>CASH</option><option>BANK_TRANSFER</option><option>QR</option></Select>
      <Btn type="submit">{uploading ? 'Đang tải file...' : 'Thu tiền'}</Btn>
      <div className="md:col-span-4"><label className="text-xs text-gray-500">Bằng chứng thanh toán (ảnh hoặc PDF, tối đa 5MB)</label><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="w-full text-sm mt-1" onChange={(e: any) => setProofFile(e.target.files?.[0] || null)} />{proofFile && <p className="text-xs text-gray-500 mt-1">Đã chọn: {proofFile.name}</p>}</div></form></Card>
    <Card><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Mã HĐ</th><th>Học viên</th><th>Tổng</th><th>Còn nợ</th><th>Hạn</th><th>Trạng thái</th></tr></thead>
      <tbody>{list.map((i: any) => <tr key={i.id} className="border-b"><td>{i.invoiceCode}</td><td>{i.student?.fullName}</td><td>{fmtVND(i.totalAmount)}</td><td>{fmtVND(i.amountDue)}</td><td>{i.dueDate?.slice(0, 10)}</td><td><Badge color={statusColor(i.status)}>{i.status}</Badge></td></tr>)}</tbody></table></Card>
  </Layout>;
}
