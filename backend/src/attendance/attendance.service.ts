import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}
  async list(q: any) {
    const where: any = {};
    if (q.classId) where.classId = q.classId;
    if (q.sessionDate) where.sessionDate = new Date(q.sessionDate);
    return this.prisma.attendance.findMany({ where, orderBy: { sessionDate: 'desc' }, include: { enrollment: { include: { student: true } } } });
  }
  // Bulk: [{enrollmentId, status, note}] + classId + sessionDate
  async bulk(dto: any) {
    const date = new Date(dto.sessionDate);
    if (isNaN(date.getTime())) throw new BadRequestException('sessionDate khong hop le (YYYY-MM-DD)');
    const results: any[] = [];
    for (const item of dto.items || []) {
      results.push(await this.prisma.attendance.upsert({
        where: { uq_attendance_session: { enrollmentId: item.enrollmentId, sessionDate: date } },
        update: { status: item.status, note: item.note || null },
        create: { enrollmentId: item.enrollmentId, classId: dto.classId, sessionDate: date, status: item.status, note: item.note || null },
      }));
    }
    return { date: dto.sessionDate, count: results.length, items: results };
  }
}
