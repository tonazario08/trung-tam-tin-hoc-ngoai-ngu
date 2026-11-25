'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { api, getToken } from '@/lib/api';
import { Card, Btn, Input, Select } from '@/components/ui';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export default function CertificatesPage() {
  const [list, setList] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [form, setForm] = useState({ studentId: '', courseId: '' });
  const [filter, setFilter] = useState({ studentId: '', courseId: '' });
  const [msg, setMsg] = useState('');
  async function load() { try { const q = new URLSearchParams(); if (filter.studentId) q.set('studentId', filter.studentId); if (filter.courseId) q.set('courseId', filter.courseId); setList(await api(`/certificates?${q.toString()}`)); } catch (e: any) { setMsg(e.message); } }
  useEffect(() => { load(); (async () => { try { setCourses((await api('/courses?limit=50')).data); } catch { /* khoa hoc tuy chon */ } })(); }, []);
  async function issueByEnrollment(e: any) { e.preventDefault(); try { const r = await api('/certificates', { method: 'POST', body: JSON.stringify({ enrollmentId }) }); setMsg(`Đã cấp chứng chỉ ${r.certificateCode} cho ${r.student?.fullName || ''}`); setEnrollmentId(''); load(); } catch (e: any) { setMsg(e.message); } }
  async function issueByStudentCourse(e: any) { e.preventDefault(); try { const r = await api('/certificates', { method: 'POST', body: JSON.stringify(form) }); setMsg(`Đã cấp chứng chỉ ${r.certificateCode} cho ${r.student?.fullName || ''}`); setForm({ studentId: '', courseId: '' }); load(); } catch (e: any) { setMsg(e.message); } }
  async function reissue(cert: any) { try { const r = await api(`/certificates/${cert.id}/issue`, { method: 'POST' }); setMsg(`Đã cấp lại chứng chỉ ${r.certificateCode}`); load(); } catch (e: any) { setMsg(e.message); } }
  // Endpoint PDF can Bearer token nen khong mo truc tiep bang window.open:
  // fetch dang blob kem Authorization roi tao object URL de tai xuong.
  async function downloadPdf(cert: any) {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/certificates/${cert.id}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(`Loi ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${cert.certificateCode}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setMsg(e.message); }
  }
  return <Layout>
    <h1 className="text-2xl font-bold mb-4">Chứng chỉ</h1>
    <div className="flex gap-2 mb-4"><Input placeholder="Lọc theo studentId..." value={filter.studentId} onChange={(e: any) => setFilter({ ...filter, studentId: e.target.value })} /><Select value={filter.courseId} onChange={(e: any) => setFilter({ ...filter, courseId: e.target.value })}><option value="">Tất cả khóa học</option>{courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select><Btn onClick={load}>Tìm</Btn></div>
    {msg && <p className="text-sm mb-3 text-blue-700">{msg}</p>}
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <Card><h2 className="font-bold mb-2">Cấp chứng chỉ theo enrollment</h2><form onSubmit={issueByEnrollment} className="space-y-2">
        <Input placeholder="Mã enrollmentId *" required value={enrollmentId} onChange={(e: any) => setEnrollmentId(e.target.value)} />
        <p className="text-xs text-gray-500">Chỉ cấp khi enrollment đã COMPLETED; nếu đã có chứng chỉ cho cặp học viên + khóa học sẽ trả về chứng chỉ có sẵn.</p>
        <Btn type="submit">Cấp chứng chỉ</Btn></form></Card>
      <Card><h2 className="font-bold mb-2">Cấp chứng chỉ theo học viên + khóa học</h2><form onSubmit={issueByStudentCourse} className="space-y-2">
        <Input placeholder="Mã học viên (studentId) *" required value={form.studentId} onChange={(e: any) => setForm({ ...form, studentId: e.target.value })} />
        <Select required value={form.courseId} onChange={(e: any) => setForm({ ...form, courseId: e.target.value })}><option value="">Chọn khóa học *</option>{courses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Btn type="submit">Cấp chứng chỉ</Btn></form></Card>
    </div>
    <Card><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Mã chứng chỉ</th><th>Học viên</th><th>Khóa học</th><th>Ngày cấp</th><th>Thao tác</th></tr></thead>
      <tbody>{list.map((c: any) => <tr key={c.id} className="border-b"><td>{c.certificateCode}</td><td>{c.student?.fullName || c.studentId}</td><td>{c.course?.name || c.courseId}</td><td>{c.issuedDate ? new Date(c.issuedDate).toLocaleDateString('vi-VN') : ''}</td>
        <td className="space-x-2"><Btn variant="secondary" onClick={() => downloadPdf(c)}>Tải PDF</Btn><Btn variant="secondary" onClick={() => reissue(c)}>Cấp lại</Btn></td></tr>)}</tbody></table></Card>
  </Layout>;
}
