import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppCacheService } from '../cache/cache.service';
@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService, private notifications: NotificationsService, private cache: AppCacheService) {}
  async list(q: any) {
    const where: any = {};
    if (q.classId) where.classId = q.classId;
    if (q.studentId) where.studentId = q.studentId;
    if (q.status) where.status = q.status;
    return this.prisma.enrollment.findMany({ where, orderBy: { enrolledAt: 'desc' }, include: { student: true, class: { include: { course: true } } } });
  }
  async enroll(dto: any) {
    const cls = await this.prisma.class.findUnique({ where: { id: dto.classId }, include: { course: true } });
    if (!cls) throw new NotFoundException('Khong tim thay lop');
    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Khong tim thay hoc vien');
    const dup = await this.prisma.enrollment.findFirst({ where: { studentId: dto.studentId, classId: dto.classId, status: 'ACTIVE' } });
    if (dup) throw new BadRequestException('Hoc vien da ghi danh lop nay (dang ACTIVE)');
    const active = await this.prisma.enrollment.count({ where: { classId: dto.classId, status: 'ACTIVE' } });
    if (active >= cls.maxStudents) throw new BadRequestException(`Lop da day (${active}/${cls.maxStudents})`);
    const discount = Number(dto.discountPercent || 0);
    const total = Number(cls.course.tuitionFee);
    const finalFee = total * (1 - discount / 100);
    const result = await this.prisma.$transaction(async (tx) => {
      const enr = await tx.enrollment.create({ data: { studentId: dto.studentId, classId: dto.classId, discountPercent: discount, finalFee } });
      const invCount = await tx.invoice.count();
      const invoice = await tx.invoice.create({ data: { studentId: dto.studentId, enrollmentId: enr.id, invoiceCode: `HD-${String(invCount + 1).padStart(4, '0')}`, totalAmount: total, discountAmount: total - finalFee, amountDue: finalFee, dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 7 * 86400000), status: 'UNPAID' } });
      return { enrollment: enr, invoice };
    });
    // Thong bao + xoa cache dashboard (khong de loi thong bao/cache lam hong ghi danh).
    try { await this.notifications.notifyAdmins('Ghi danh mới', `${student.fullName} vừa ghi danh lớp ${cls.classCode} (${cls.course.name}). Hóa đơn ${result.invoice.invoiceCode}: ${finalFee.toLocaleString('vi-VN')} đ.`, 'ENROLLMENT'); } catch { /* bo qua */ }
    try { await this.cache.del('dashboard:overview'); } catch { /* bo qua */ }
    return result;
  }
  async updateStatus(id: string, status: string) {
    return this.prisma.enrollment.update({ where: { id }, data: { status: status as any } });
  }
}
