import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const firstNames = ['An', 'Bình', 'Chi', 'Dũng', 'Hà', 'Hùng', 'Lan', 'Linh', 'Minh', 'Nam', 'Ngọc', 'Phong', 'Quân', 'Thảo', 'Thu', 'Trang', 'Tuấn', 'Vy', 'Yến', 'Khang'];
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];

async function main() {
  console.log('Seeding...');
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const teacherHash = await bcrypt.hash('Teacher123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@trungtam.vn' },
    update: {},
    create: { email: 'admin@trungtam.vn', passwordHash: adminHash, fullName: 'Quản trị viên', role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'giaovu@trungtam.vn' },
    update: {},
    create: { email: 'giaovu@trungtam.vn', passwordHash: adminHash, fullName: 'Giáo vụ', role: 'ACADEMIC' },
  });

  // Rooms
  const rooms = [];
  for (const [name, cap, loc] of [['P101', 30, 'Tầng 1'], ['P102', 25, 'Tầng 1'], ['P201', 30, 'Tầng 2'], ['P202', 20, 'Tầng 2']] as const) {
    rooms.push(await prisma.room.upsert({ where: { name }, update: {}, create: { name, capacity: cap, location: loc } }));
  }

  // Courses
  const courseData = [
    { name: 'Tiếng Anh A1', category: 'ENGLISH' as const, level: 'A1', tuitionFee: 3500000 },
    { name: 'Tiếng Anh A2', category: 'ENGLISH' as const, level: 'A2', tuitionFee: 3800000 },
    { name: 'Tiếng Hàn Sơ cấp', category: 'KOREAN' as const, level: 'Sơ cấp', tuitionFee: 3200000 },
    { name: 'MOS Word & Excel', category: 'IT' as const, level: 'Cơ bản', tuitionFee: 2500000 },
    { name: 'Lập trình Python', category: 'IT' as const, level: 'Cơ bản', tuitionFee: 4200000 },
    { name: 'Thiết kế đồ họa', category: 'IT' as const, level: 'Cơ bản', tuitionFee: 4000000 },
  ];
  const courses = [];
  for (const c of courseData) {
    courses.push(await prisma.course.create({ data: { ...c, durationWeeks: 12, totalSessions: 24, description: `Khóa ${c.name}` } }));
  }

  // Teachers (5)
  const teacherData = [
    { name: 'Nguyễn Thị Mai', email: 'mai@trungtam.vn', spec: 'Tiếng Anh', rate: 300000 },
    { name: 'Trần Văn Hùng', email: 'hung@trungtam.vn', spec: 'Tiếng Hàn', rate: 280000 },
    { name: 'Lê Minh Tuấn', email: 'tuan@trungtam.vn', spec: 'Lập trình Python', rate: 350000 },
    { name: 'Phạm Thu Hà', email: 'ha@trungtam.vn', spec: 'Tin học văn phòng - MOS', rate: 250000 },
    { name: 'Đỗ Quốc Bảo', email: 'bao@trungtam.vn', spec: 'Thiết kế đồ họa', rate: 320000 },
  ];
  const teachers = [];
  for (const t of teacherData) {
    const user = await prisma.user.upsert({ where: { email: t.email }, update: {}, create: { email: t.email, passwordHash: teacherHash, fullName: t.name, role: 'TEACHER' } });
    teachers.push(await prisma.teacher.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, specialization: t.spec, hourlyRate: t.rate, degree: 'Cử nhân' } }));
  }

  // Classes (6)
  const classData = [
    { code: 'ENG-A1-01', course: 0, teacher: 0, room: 0, max: 25, start: '2026-11-02', schedules: [{ weekday: 2, startTime: '18:00', endTime: '20:00' }, { weekday: 4, startTime: '18:00', endTime: '20:00' }, { weekday: 6, startTime: '18:00', endTime: '20:00' }] },
    { code: 'ENG-A2-01', course: 1, teacher: 0, room: 1, max: 25, start: '2026-11-03', schedules: [{ weekday: 3, startTime: '18:00', endTime: '20:00' }, { weekday: 5, startTime: '18:00', endTime: '20:00' }] },
    { code: 'KOR-01', course: 2, teacher: 1, room: 1, max: 20, start: '2026-11-02', schedules: [{ weekday: 2, startTime: '19:00', endTime: '21:00' }, { weekday: 5, startTime: '19:00', endTime: '21:00' }] },
    { code: 'MOS-01', course: 3, teacher: 3, room: 2, max: 30, start: '2026-11-07', schedules: [{ weekday: 7, startTime: '08:00', endTime: '11:00' }, { weekday: 1, startTime: '08:00', endTime: '11:00' }] },
    { code: 'PY-01', course: 4, teacher: 2, room: 2, max: 25, start: '2026-11-03', schedules: [{ weekday: 3, startTime: '18:30', endTime: '20:30' }, { weekday: 6, startTime: '18:30', endTime: '20:30' }] },
    { code: 'DESIGN-01', course: 5, teacher: 4, room: 3, max: 20, start: '2026-11-04', schedules: [{ weekday: 4, startTime: '18:00', endTime: '20:30' }, { weekday: 7, startTime: '13:30', endTime: '16:00' }] },
  ];
  const classes = [];
  for (const c of classData) {
    const cls = await prisma.class.create({
      data: { classCode: c.code, name: `${courses[c.course].name} - ${c.code}`, courseId: courses[c.course].id, teacherId: teachers[c.teacher].id, roomId: rooms[c.room].id, maxStudents: c.max, startDate: new Date(c.start), status: 'RUNNING' },
    });
    for (const s of c.schedules) await prisma.classSchedule.create({ data: { classId: cls.id, weekday: s.weekday, startTime: s.startTime, endTime: s.endTime, roomId: rooms[c.room].id } });
    classes.push(cls);
  }

  // Students (20)
  const students = [];
  for (let i = 0; i < 20; i++) {
    const fullName = `${lastNames[i % lastNames.length]} ${firstNames[i]} ${firstNames[(i + 5) % 20]}`;
    students.push(await prisma.student.create({
      data: { studentCode: `HV2026-${String(i + 1).padStart(3, '0')}`, fullName, phone: `090${1000000 + i * 12345}`, email: `hv${i + 1}@example.com`, parentName: `Phụ huynh ${fullName}`, parentPhone: `091${1000000 + i * 11111}`, status: 'STUDYING' },
    }));
  }

  // Enrollments + invoices: first 12 students into classes round-robin, some paid
  for (let i = 0; i < 12; i++) {
    const cls = classes[i % classes.length];
    const course = courses[classData[i % classes.length].course];
    const total = Number(course.tuitionFee);
    const enr = await prisma.enrollment.create({ data: { studentId: students[i].id, classId: cls.id, finalFee: total } });
    const inv = await prisma.invoice.create({ data: { studentId: students[i].id, enrollmentId: enr.id, invoiceCode: `HD-${String(i + 1).padStart(4, '0')}`, totalAmount: total, discountAmount: 0, amountDue: total, dueDate: new Date('2026-12-01'), status: 'UNPAID' } });
    if (i < 4) {
      // Thu 2.000.000 -> PARTIAL
      await prisma.payment.create({ data: { invoiceId: inv.id, amount: 2000000, method: 'QR' } });
      await prisma.invoice.update({ where: { id: inv.id }, data: { amountDue: total - 2000000, status: 'PARTIAL' } });
    } else if (i < 6) {
      await prisma.payment.create({ data: { invoiceId: inv.id, amount: total, method: 'BANK_TRANSFER' } });
      await prisma.invoice.update({ where: { id: inv.id }, data: { amountDue: 0, status: 'PAID' } });
    }
    // 1 overdue invoice
    if (i === 6) await prisma.invoice.update({ where: { id: inv.id }, data: { dueDate: new Date('2026-11-01'), status: 'OVERDUE' } });
  }
  console.log('Seed done: 5 teachers, 20 students, 6 classes, 12 enrollments');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
