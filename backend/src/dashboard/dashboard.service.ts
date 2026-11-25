import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppCacheService } from '../cache/cache.service';
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService, private cache: AppCacheService) {}
  async overview() {
    // Cache 60 giay; Redis tat thi get() tra null va chay nhu binh thuong.
    const cached = await this.cache.get<any>('dashboard:overview');
    if (cached) return { ...cached, cached: true };
    const data = await this.computeOverview();
    await this.cache.set('dashboard:overview', data, 60);
    return { ...data, cached: false };
  }
  private async computeOverview() {
    await this.prisma.invoice.updateMany({ where: { status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { lt: new Date() } }, data: { status: 'OVERDUE' } });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [students, classesRunning, overdue, revenue] = await Promise.all([
      this.prisma.student.count({ where: { status: 'STUDYING' } }),
      this.prisma.class.count({ where: { status: 'RUNNING' } }),
      this.prisma.invoice.findMany({ where: { status: 'OVERDUE' }, include: { student: true }, take: 10, orderBy: { dueDate: 'asc' } }),
      this.prisma.payment.aggregate({ where: { paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    ]);
    const totalDue = await this.prisma.invoice.aggregate({ where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } }, _sum: { amountDue: true } });
    const todayClasses = await this.prisma.class.findMany({ where: { status: { in: ['OPEN', 'RUNNING'] } }, include: { course: true, teacher: { include: { user: true } }, room: true, schedules: true }, take: 20 });
    const weekday = now.getDay() === 0 ? 1 : now.getDay() + 1; // JS 0=CN -> DB 1=CN, 1=T2 -> 2...
    const today = todayClasses.filter((c: any) => c.schedules.some((s: any) => s.weekday === weekday)).map((c: any) => ({ id: c.id, classCode: c.classCode, name: c.name, courseName: c.course.name, teacherName: c.teacher?.user.fullName || '', roomName: c.room?.name || '', schedules: c.schedules.filter((s: any) => s.weekday === weekday) }));
    return { totalStudents: students, classesRunning, overdueCount: overdue.length, overdue, revenueThisMonth: Number(revenue._sum.amount || 0), totalOutstanding: Number(totalDue._sum.amountDue || 0), todayClasses: today };
  }
}
