import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}
  async list(q: any) {
    const where: any = {};
    if (q.enrollmentId) where.enrollmentId = q.enrollmentId;
    return this.prisma.grade.findMany({ where, orderBy: { gradedAt: 'desc' }, include: { enrollment: { include: { student: true, class: true } } } });
  }
  async create(dto: any, userId: string) {
    const score = Number(dto.score);
    if (isNaN(score) || score < 0 || score > 10) throw new BadRequestException('Diem phai tu 0 den 10');
    return this.prisma.grade.create({ data: { enrollmentId: dto.enrollmentId, type: dto.type, score, comment: dto.comment, gradedById: userId } });
  }
}
