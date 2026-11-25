import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { pageParams, pageResult } from '../common/pagination';
@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}
  async list(q: any) {
    const { page, limit, skip } = pageParams(q);
    const where: any = {};
    if (q.search) where.user = { fullName: { contains: q.search, mode: 'insensitive' } };
    if (q.status) where.status = q.status;
    const [items, total] = await Promise.all([
      this.prisma.teacher.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, email: true, fullName: true, phone: true } }, classes: { include: { course: true } } } }),
      this.prisma.teacher.count({ where }),
    ]);
    return pageResult(items, total, page, limit);
  }
  async create(dto: any) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email da ton tai');
    const hash = await bcrypt.hash(dto.password || 'Teacher123!', 10);
    const user = await this.prisma.user.create({ data: { email: dto.email, passwordHash: hash, fullName: dto.fullName, phone: dto.phone, role: 'TEACHER' } });
    return this.prisma.teacher.create({ data: { userId: user.id, specialization: dto.specialization, degree: dto.degree, hourlyRate: dto.hourlyRate || 0, bio: dto.bio }, include: { user: true } });
  }
  async update(id: string, dto: any) {
    const t = await this.prisma.teacher.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Khong tim thay giao vien');
    return this.prisma.teacher.update({ where: { id }, data: { specialization: dto.specialization, degree: dto.degree, hourlyRate: dto.hourlyRate, status: dto.status, bio: dto.bio }, include: { user: true } });
  }
  async remove(id: string) {
    const t = await this.prisma.teacher.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Khong tim thay giao vien');
    await this.prisma.teacher.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id: t.userId } }).catch(() => null);
    return { deleted: true };
  }
}
