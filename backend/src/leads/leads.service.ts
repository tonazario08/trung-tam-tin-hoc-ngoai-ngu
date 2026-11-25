import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { pageParams, pageResult } from '../common/pagination';

const LEAD_INCLUDE = {
  interestedCourse: true,
  assignedTo: { select: { id: true, email: true, fullName: true, role: true } },
};

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async list(q: any) {
    const { page, limit, skip } = pageParams(q);
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.search) {
      where.OR = [
        { fullName: { contains: q.search, mode: 'insensitive' } },
        { phone: { contains: q.search } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: LEAD_INCLUDE }),
      this.prisma.lead.count({ where }),
    ]);
    return pageResult(items, total, page, limit);
  }

  async get(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id }, include: LEAD_INCLUDE });
    if (!lead) throw new NotFoundException('Khong tim thay lead');
    return lead;
  }

  async create(dto: any) {
    if (!dto?.fullName || !dto?.phone) throw new BadRequestException('Thieu ho ten hoac SDT');
    return this.prisma.lead.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        interestedCourseId: dto.interestedCourseId || null,
        source: dto.source || null,
        status: dto.status || 'NEW',
        assignedToId: dto.assignedToId || null,
      },
      include: LEAD_INCLUDE,
    });
  }

  async update(id: string, dto: any) {
    await this.get(id);
    const data: any = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.interestedCourseId !== undefined) data.interestedCourseId = dto.interestedCourseId || null;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assignedToId !== undefined) data.assignedToId = dto.assignedToId || null;
    return this.prisma.lead.update({ where: { id }, data, include: LEAD_INCLUDE });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.lead.delete({ where: { id } });
  }

  // Chuyen lead thanh hoc vien: tao User + Student, doi lead sang ENROLLED (1 transaction).
  async convert(id: string) {
    const lead = await this.get(id);
    if (lead.status === 'ENROLLED') throw new BadRequestException('Lead da duoc chuyen thanh hoc vien');
    // Lead khong co truong email trong schema -> suy ra tu SDT.
    const baseEmail = `lead-${String(lead.phone).replace(/[^0-9a-zA-Z]/g, '')}@lead.local`;
    const passwordHash = await bcrypt.hash('Student123!', 10);
    return this.prisma.$transaction(async (tx) => {
      // Email unique: neu trung thi them hau to so.
      let email = baseEmail;
      let suffix = 2;
      while (await tx.user.findUnique({ where: { email } })) {
        const [local, domain] = baseEmail.split('@');
        email = `${local}-${suffix}@${domain}`;
        suffix += 1;
      }
      const user = await tx.user.create({
        data: { email, passwordHash, fullName: lead.fullName, phone: lead.phone, role: 'STUDENT' },
      });
      const count = await tx.student.count();
      const studentCode = `HV2026-${String(count + 1).padStart(3, '0')}`;
      const student = await tx.student.create({
        data: { userId: user.id, studentCode, fullName: lead.fullName, phone: lead.phone, email },
      });
      const updatedLead = await tx.lead.update({
        where: { id },
        data: { status: 'ENROLLED' },
        include: LEAD_INCLUDE,
      });
      return { lead: updatedLead, student, user };
    });
  }
}
