import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pageParams, pageResult } from '../common/pagination';
function toMin(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function overlap(aS: string, aE: string, bS: string, bE: string) { return toMin(aS) < toMin(bE) && toMin(bS) < toMin(aE); }
@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}
  async list(q: any) {
    const { page, limit, skip } = pageParams(q);
    const where: any = {};
    if (q.search) where.OR = [{ classCode: { contains: q.search, mode: 'insensitive' } }, { name: { contains: q.search, mode: 'insensitive' } }];
    if (q.status) where.status = q.status;
    if (q.courseId) where.courseId = q.courseId;
    const [items, total] = await Promise.all([
      this.prisma.class.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { course: true, teacher: { include: { user: true } }, room: true, schedules: true, _count: { select: { enrollments: true } } } }),
      this.prisma.class.count({ where }),
    ]);
    // Chi dem enrollment ACTIVE
    for (const c of items as any[]) {
      c.activeEnrollments = await this.prisma.enrollment.count({ where: { classId: c.id, status: 'ACTIVE' } });
    }
    return pageResult(items, total, page, limit);
  }
  async get(id: string) {
    const c = await this.prisma.class.findUnique({ where: { id }, include: { course: true, teacher: { include: { user: true } }, room: true, schedules: true, enrollments: { include: { student: true } } } });
    if (!c) throw new NotFoundException('Khong tim thay lop');
    return c;
  }
  async create(dto: any) {
    const count = await this.prisma.class.count();
    const code = dto.classCode || `LOP-${String(count + 1).padStart(3, '0')}`;
    return this.prisma.class.create({ data: { classCode: code, name: dto.name, courseId: dto.courseId, teacherId: dto.teacherId || null, roomId: dto.roomId || null, maxStudents: dto.maxStudents || 25, startDate: dto.startDate ? new Date(dto.startDate) : undefined, endDate: dto.endDate ? new Date(dto.endDate) : undefined, status: dto.status || 'OPEN' } });
  }
  async update(id: string, dto: any) {
    await this.get(id);
    const data: any = { ...dto }; if (dto.startDate) data.startDate = new Date(dto.startDate); if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.class.update({ where: { id }, data });
  }
  async addSchedule(classId: string, dto: any) {
    const cls = await this.get(classId);
    // Kiem tra trung lich: cung giao vien hoac cung phong, cung thu, trung gio
    const others = await this.prisma.classSchedule.findMany({ where: { weekday: dto.weekday }, include: { class: true } });
    for (const s of others) {
      if (!overlap(dto.startTime, dto.endTime, s.startTime, s.endTime)) continue;
      if (cls.teacherId && s.class.teacherId === cls.teacherId) throw new BadRequestException(`Giao vien da co lich ${s.startTime}-${s.endTime} thu ${dto.weekday} (lop ${s.class.classCode})`);
      if (dto.roomId && s.roomId === dto.roomId) throw new BadRequestException(`Phong da duoc dung ${s.startTime}-${s.endTime} thu ${dto.weekday} (lop ${s.class.classCode})`);
    }
    return this.prisma.classSchedule.create({ data: { classId, weekday: dto.weekday, startTime: dto.startTime, endTime: dto.endTime, roomId: dto.roomId || cls.roomId || null } });
  }
  async weekSchedule(q: any) {
    const classes = await this.prisma.class.findMany({ where: { status: { in: ['OPEN', 'RUNNING'] } }, include: { course: true, teacher: { include: { user: true } }, room: true, schedules: true } });
    const out: any[] = [];
    for (const c of classes) for (const s of c.schedules) out.push({ classId: c.id, classCode: c.classCode, className: c.name, courseName: c.course.name, teacherName: c.teacher?.user.fullName || '', roomName: c.room?.name || '', weekday: s.weekday, startTime: s.startTime, endTime: s.endTime });
    return out.sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime));
  }
}
