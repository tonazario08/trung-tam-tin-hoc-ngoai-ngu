import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pageParams, pageResult } from '../common/pagination';
import { NotificationsService } from '../notifications/notifications.service';
import { AppCacheService } from '../cache/cache.service';
@Injectable()
export class InvoicesService {
  // Nho cac hoa don da thong bao qua han (trong bo nho, reset khi restart)
  // de khong spam thong bao moi lan goi list/dashboard.
  private notifiedOverdue = new Set<string>();
  constructor(private prisma: PrismaService, private notifications: NotificationsService, private cache: AppCacheService) {}
  async refreshOverdue() {
    const candidates = await this.prisma.invoice.findMany({ where: { status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { lt: new Date() } }, select: { id: true, invoiceCode: true } });
    await this.prisma.invoice.updateMany({ where: { status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { lt: new Date() } }, data: { status: 'OVERDUE' } });
    const fresh = candidates.filter((c) => !this.notifiedOverdue.has(c.id));
    if (fresh.length) {
      fresh.forEach((c) => this.notifiedOverdue.add(c.id));
      try { await this.notifications.notifyAdmins('Hóa đơn quá hạn', `${fresh.length} hóa đơn quá hạn: ${fresh.map((c) => c.invoiceCode).join(', ')}.`, 'OVERDUE'); } catch { /* bo qua */ }
    }
  }
  async list(q: any) {
    await this.refreshOverdue();
    const { page, limit, skip } = pageParams(q);
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.studentId) where.studentId = q.studentId;
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { student: true, payments: true, enrollment: { include: { class: { include: { course: true } } } } } }),
      this.prisma.invoice.count({ where }),
    ]);
    return pageResult(items, total, page, limit);
  }
  async get(id: string) {
    const inv = await this.prisma.invoice.findUnique({ where: { id }, include: { student: true, payments: true } });
    if (!inv) throw new NotFoundException('Khong tim thay hoa don');
    return inv;
  }
  async pay(invoiceId: string, dto: any, userId: string) {
    const inv = await this.get(invoiceId);
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new BadRequestException('So tien phai > 0');
    if (amount > Number(inv.amountDue) + 0.01) throw new BadRequestException(`So tien vuot con no (${inv.amountDue})`);
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({ data: { invoiceId, amount, method: dto.method || 'CASH', receivedById: userId, note: dto.note, proofUrl: dto.proofUrl || null } });
      const paid = await tx.payment.aggregate({ where: { invoiceId }, _sum: { amount: true } });
      const paidTotal = Number(paid._sum.amount || 0);
      const totalDue = Number(inv.totalAmount) - Number(inv.discountAmount);
      const remaining = totalDue - paidTotal;
      const status = remaining <= 0.01 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'UNPAID';
      const updated = await tx.invoice.update({ where: { id: invoiceId }, data: { amountDue: remaining, status: status as any } });
      return { payment, invoice: updated, paidTotal, remaining };
    });
    try {
      await this.notifications.notifyAdmins('Đã thu học phí', `Đã thu ${amount.toLocaleString('vi-VN')} đ cho hóa đơn ${inv.invoiceCode} (${inv.student?.fullName || ''}). Còn nợ ${result.remaining.toLocaleString('vi-VN')} đ (${result.invoice.status}).`, 'PAYMENT');
      if ((inv.student as any)?.userId) await this.notifications.notify((inv.student as any).userId, 'Đã nhận học phí', `Trung tâm đã nhận ${amount.toLocaleString('vi-VN')} đ cho hóa đơn ${inv.invoiceCode}. Còn nợ ${result.remaining.toLocaleString('vi-VN')} đ.`, 'PAYMENT');
    } catch { /* bo qua */ }
    try { await this.cache.del('dashboard:overview'); } catch { /* bo qua */ }
    return result;
  }
}
