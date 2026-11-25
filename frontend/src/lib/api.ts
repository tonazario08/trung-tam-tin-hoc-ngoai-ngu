// Client goi API backend NestJS. Token JWT luu o localStorage.
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export function getToken() { if (typeof window === 'undefined') return null; return localStorage.getItem('tt_token'); }
export function getUser() { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem('tt_user') || 'null'); } catch { return null; } }
export async function api(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
  });
  const text = await res.text();
  let data: any = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(data?.message || `Loi ${res.status}`);
  return data;
}
export async function login(email: string, password: string) {
  const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem('tt_token', data.accessToken);
  localStorage.setItem('tt_refresh', data.refreshToken);
  localStorage.setItem('tt_user', JSON.stringify(data.user));
  return data.user;
}
export function logout() { localStorage.removeItem('tt_token'); localStorage.removeItem('tt_refresh'); localStorage.removeItem('tt_user'); window.location.href = '/login'; }
export const fmtVND = (n: any) => Number(n || 0).toLocaleString('vi-VN') + ' đ';
export const WEEKDAYS: Record<number, string> = { 1: 'CN', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6', 7: 'T7' };
