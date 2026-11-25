/**
 * Logic nghiep vu thuan (pure functions), tach ra tu cac service hien co
 * de test unit duoc ma khong can NestJS / DB. Khong sua file service cu:
 * cac ham duoi day copy dung logic goc.
 */

// --- classes.service.ts ---
export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function overlap(aS: string, aE: string, bS: string, bE: string): boolean {
  return toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE);
}

// --- invoices.service.ts (pay) ---
export type InvoiceStatus = 'PAID' | 'PARTIAL' | 'UNPAID';

export function invoiceStatus(
  totalAmount: number,
  discountAmount: number,
  paidTotal: number,
): { remaining: number; status: InvoiceStatus } {
  const totalDue = Number(totalAmount) - Number(discountAmount);
  const remaining = totalDue - Number(paidTotal);
  const status: InvoiceStatus =
    remaining <= 0.01 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'UNPAID';
  return { remaining, status };
}

// --- grades.service.ts (create) ---
export function validateScore(score: number): boolean {
  const s = Number(score);
  if (isNaN(s) || s < 0 || s > 10) return false;
  return true;
}

// --- attendance.service.ts (bulk) ---
// Upsert diem danh theo unique key (enrollmentId, sessionDate)
// (uq_attendance_session); chuoi nay minh hoa key do.
export function attendanceUpsertKey(
  enrollmentId: string,
  sessionDate: string,
): string {
  return `${enrollmentId}|${sessionDate}`;
}
