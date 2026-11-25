import {
  overlap,
  toMin,
  invoiceStatus,
  validateScore,
  attendanceUpsertKey,
} from './business';

describe('toMin / overlap (chong lich, classes.service.ts)', () => {
  it('toMin doi "18:00" thanh 1080 phut', () => {
    expect(toMin('18:00')).toBe(18 * 60);
    expect(toMin('08:30')).toBe(8 * 60 + 30);
  });

  it('trung nhau: 18:00-20:00 vs 19:00-21:00', () => {
    expect(overlap('18:00', '20:00', '19:00', '21:00')).toBe(true);
  });

  it('ke nhau khong trung: 18:00-20:00 vs 20:00-21:00', () => {
    expect(overlap('18:00', '20:00', '20:00', '21:00')).toBe(false);
    expect(overlap('20:00', '21:00', '18:00', '20:00')).toBe(false);
  });

  it('chua nhau: 18:00-21:00 chua 19:00-20:00', () => {
    expect(overlap('18:00', '21:00', '19:00', '20:00')).toBe(true);
    expect(overlap('19:00', '20:00', '18:00', '21:00')).toBe(true);
  });

  it('khong trung: 18:00-19:00 vs 20:00-21:00', () => {
    expect(overlap('18:00', '19:00', '20:00', '21:00')).toBe(false);
  });

  it('cung khung gio thi trung nhau', () => {
    expect(overlap('18:00', '20:00', '18:00', '20:00')).toBe(true);
  });
});

describe('invoiceStatus (con no / trang thai, invoices.service.ts pay)', () => {
  it('chua thu: 3.500.000 - 0 - 0 = con 3.500.000, UNPAID', () => {
    expect(invoiceStatus(3500000, 0, 0)).toEqual({
      remaining: 3500000,
      status: 'UNPAID',
    });
  });

  it('thu mot phan: 2.000.000/3.500.000 con 1.500.000, PARTIAL', () => {
    expect(invoiceStatus(3500000, 0, 2000000)).toEqual({
      remaining: 1500000,
      status: 'PARTIAL',
    });
  });

  it('giam gia duoc tru truoc khi tinh con no', () => {
    // Tong 3.500.000, giam 500.000, da thu 2.000.000 -> con 1.000.000 PARTIAL
    expect(invoiceStatus(3500000, 500000, 2000000)).toEqual({
      remaining: 1000000,
      status: 'PARTIAL',
    });
  });

  it('thu du: con 0, PAID', () => {
    expect(invoiceStatus(3500000, 0, 3500000)).toEqual({
      remaining: 0,
      status: 'PAID',
    });
  });

  it('thu vuot: remaining am -> PAID', () => {
    const r = invoiceStatus(3500000, 0, 3600000);
    expect(r.remaining).toBe(-100000);
    expect(r.status).toBe('PAID');
  });
});

describe('validateScore (diem 0-10, grades.service.ts)', () => {
  it.each([0, 10, 8.5, 5, 9.75])('diem hop le: %s', (s) => {
    expect(validateScore(s)).toBe(true);
  });

  it.each([-1, 11, NaN, -0.5, 10.01])('diem khong hop le: %s', (s) => {
    expect(validateScore(s)).toBe(false);
  });
});

describe('attendanceUpsertKey (upsert theo unique key, attendance.service.ts)', () => {
  it('cung enrollment + ngay cho cung key', () => {
    expect(attendanceUpsertKey('enr-1', '2026-11-25')).toBe(
      attendanceUpsertKey('enr-1', '2026-11-25'),
    );
    expect(attendanceUpsertKey('enr-1', '2026-11-25')).toBe(
      'enr-1|2026-11-25',
    );
  });

  it('khac ngay thi khac key', () => {
    expect(attendanceUpsertKey('enr-1', '2026-11-25')).not.toBe(
      attendanceUpsertKey('enr-1', '2026-11-26'),
    );
  });

  it('khac enrollment thi khac key', () => {
    expect(attendanceUpsertKey('enr-1', '2026-11-25')).not.toBe(
      attendanceUpsertKey('enr-2', '2026-11-25'),
    );
  });
});
