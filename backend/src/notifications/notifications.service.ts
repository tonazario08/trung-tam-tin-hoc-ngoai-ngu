import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pageParams, pageResult } from '../common/pagination';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Tao 1 notification cho 1 user. Dung chung cho cac module khac. */
  async notify(userId: string, title: string, message: string, type = 'INFO') {
    return this.prisma.notification.create({ data: { userId, title, message, type } });
  }

  /** Tao notification cho moi user co role ADMIN hoac ACADEMIC. */
  async notifyAdmins(title: string, message: string, type = 'INFO') {
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'ACADEMIC'] } },
      select: { id: true },
    });
    if (!admins.length) return [];
    return this.prisma.notification.createMany({
      data: admins.map((a) => ({ userId: a.id, title, message, type })),
    });
  }

  /** Danh sach notification cua 1 user, phan trang. q: { page, limit, unreadOnly }. */
  async listForUser(userId: string, q: any = {}) {
    const { page, limit, skip } = pageParams(q);
    const where: any = { userId };
    if (q.unreadOnly === true || q.unreadOnly === 'true') where.isRead = false;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where }),
    ]);
    return pageResult(items, total, page, limit);
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } });
    return { unreadCount: count };
  }

  /** Chi chu so huu moi duoc danh dau da doc; sai user thi 404 (khong lo thong tin). */
  async markRead(id: string, userId: string) {
    const n = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!n) throw new NotFoundException('Khong tim thay thong bao');
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    const r = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: r.count };
  }
}
