import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { pageParams, pageResult } from '../common/pagination';
@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}
  async list(q: any) {
    const { page, limit, skip } = pageParams(q);
    const where: any = {};
    if (q.search) where.OR = [{ fullName: { contains: q.search, mode: 'insensitive' } }, { studentCode: { contains: q.search, mode: 'insensitive' } }, { phone: { contains: q.search } }];
    if (q.status) where.status = q.status;
    const [items, total] = await Promise.all([
      this.prisma.student.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { enrollments: { include: { class: { include: { course: true } } } } } }),
      this.prisma.student.count({ where }),
    ]);
    return pageResult(items, total, page, limit);
  }
  async get(id: string) {
    const s = await this.prisma.student.findUnique({ where: { id }, include: { enrollments: { include: { class: { include: { course: true, teacher: { include: { user: true } } } }, grades: true } }, invoices: { include: { payments: true } } } });
    if (!s) throw new NotFoundException('Khong tim thay hoc vien');
    return s;
  }
  async create(dto: any) {
    const count = await this.prisma.student.count();
    const code = dto.studentCode || `HV2026-${String(count + 1).padStart(3, '0')}`;
    const student = await this.prisma.student.create({ data: { studentCode: code, fullName: dto.fullName, dob: dto.dob ? new Date(dto.dob) : undefined, gender: dto.gender, phone: dto.phone, email: dto.email, parentName: dto.parentName, parentPhone: dto.parentPhone, address: dto.address, status: dto.status || 'STUDYING' } });
    // Ghi chu: avatarUrl nam o model User, KHONG phai model Student (Student khong co
    // cot avatarUrl) nen khong them vao data tao Student o tren. Neu co email thi tim
    // User tuong ung va cap nhat avatarUrl cho User do; khong co email hoac khong tim
    // thay User thi bo qua (khong lam loi viec tao hoc vien).
    if (dto.avatarUrl && dto.email) {
      try {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (user) await this.prisma.user.update({ where: { id: user.id }, data: { avatarUrl: dto.avatarUrl } });
      } catch { /* bo qua loi cap nhat avatar */ }
    }
    return student;
  }
  async update(id: string, dto: any) {
    await this.get(id);
    const data: any = { ...dto }; if (dto.dob) data.dob = new Date(dto.dob);
    return this.prisma.student.update({ where: { id }, data });
  }
  async remove(id: string) { await this.get(id); return this.prisma.student.delete({ where: { id } }); }
  // Import CSV don gian: moi dong "fullName,phone,email,parentName,parentPhone"
  async importCsv(text: string) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const created: any[] = [];
    for (const line of lines) {
      const [fullName, phone, email, parentName, parentPhone] = line.split(',').map(s => (s || '').trim());
      if (!fullName) continue;
      created.push(await this.create({ fullName, phone, email, parentName, parentPhone }));
    }
    return { imported: created.length, students: created };
  }
}
