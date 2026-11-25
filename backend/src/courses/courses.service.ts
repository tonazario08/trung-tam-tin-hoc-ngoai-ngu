import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pageParams, pageResult } from '../common/pagination';
@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}
  async list(q: any) {
    const { page, limit, skip } = pageParams(q);
    const where: any = {};
    if (q.search) where.name = { contains: q.search, mode: 'insensitive' };
    if (q.category) where.category = q.category;
    const [items, total] = await Promise.all([
      this.prisma.course.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { _count: { select: { classes: true } } } }),
      this.prisma.course.count({ where }),
    ]);
    return pageResult(items, total, page, limit);
  }
  create(dto: any) { return this.prisma.course.create({ data: { name: dto.name, category: dto.category, level: dto.level, durationWeeks: dto.durationWeeks || 12, totalSessions: dto.totalSessions || 24, tuitionFee: dto.tuitionFee || 0, description: dto.description } }); }
  async update(id: string, dto: any) {
    if (!(await this.prisma.course.findUnique({ where: { id } }))) throw new NotFoundException('Khong tim thay khoa hoc');
    return this.prisma.course.update({ where: { id }, data: dto });
  }
  async remove(id: string) { return this.prisma.course.delete({ where: { id } }); }
  rooms() { return this.prisma.room.findMany({ orderBy: { name: 'asc' } }); }
  createRoom(dto: any) { return this.prisma.room.create({ data: { name: dto.name, capacity: dto.capacity || 30, location: dto.location } }); }
}
