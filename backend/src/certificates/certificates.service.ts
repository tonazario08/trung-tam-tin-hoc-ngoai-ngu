import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
// pdfkit 0.21 la CommonJS (export =), tsconfig khong co esModuleInterop
// nen import mac dinh se loi 'pdfkit_1.default is not a constructor'.
import PDFDocument = require('pdfkit');
import { PrismaService } from '../prisma/prisma.service';

const CERT_INCLUDE = { student: true, course: true };

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async list(q: any) {
    const where: any = {};
    if (q.studentId) where.studentId = q.studentId;
    if (q.courseId) where.courseId = q.courseId;
    return this.prisma.certificate.findMany({ where, orderBy: { issuedDate: 'desc' }, include: CERT_INCLUDE });
  }

  async get(id: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id }, include: CERT_INCLUDE });
    if (!cert) throw new NotFoundException('Khong tim thay chung chi');
    return cert;
  }

  // Giai quyet studentId/courseId tu enrollmentId hoac truc tiep tu body.
  private async resolveStudentCourse(dto: any): Promise<{ studentId: string; courseId: string }> {
    if (dto?.enrollmentId) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: dto.enrollmentId },
        include: { student: true, class: { include: { course: true } } },
      });
      if (!enrollment) throw new NotFoundException('Khong tim thay enrollment');
      if (enrollment.status !== 'COMPLETED') throw new BadRequestException('Chưa hoàn thành khóa học');
      return { studentId: enrollment.studentId, courseId: enrollment.class.courseId };
    }
    if (!dto?.studentId || !dto?.courseId) throw new BadRequestException('Thieu enrollmentId hoac studentId/courseId');
    const [student, course] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: dto.studentId } }),
      this.prisma.course.findUnique({ where: { id: dto.courseId } }),
    ]);
    if (!student) throw new NotFoundException('Khong tim thay hoc vien');
    if (!course) throw new NotFoundException('Khong tim thay khoa hoc');
    return { studentId: dto.studentId, courseId: dto.courseId };
  }

  async create(dto: any) {
    const { studentId, courseId } = await this.resolveStudentCourse(dto);
    // Da co chung chi cho cap student+course thi tra ve cai co san, khong tao trung.
    const existing = await this.prisma.certificate.findFirst({ where: { studentId, courseId }, include: CERT_INCLUDE });
    if (existing) return existing;
    const count = await this.prisma.certificate.count();
    const certificateCode = `CC-2026-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.certificate.create({
      data: { studentId, courseId, certificateCode, issuedDate: dto?.issuedDate ? new Date(dto.issuedDate) : new Date() },
      include: CERT_INCLUDE,
    });
  }

  // Cap lai chung chi da co: kiem tra lai dieu kien hoan thanh (neu co enrollment),
  // roi cap nhat ngay cap moi.
  async issue(id: string) {
    const cert = await this.get(id);
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId: cert.studentId, class: { courseId: cert.courseId } },
      include: { class: true },
    });
    if (enrollment && enrollment.status !== 'COMPLETED') throw new BadRequestException('Chưa hoàn thành khóa học');
    return this.prisma.certificate.update({ where: { id }, data: { issuedDate: new Date() }, include: CERT_INCLUDE });
  }

  // Sinh file PDF chung chi (A4 landscape) va stream ve client qua Express res.
  async pdf(id: string, res: Response) {
    const cert = await this.get(id);
    const issued = new Date(cert.issuedDate).toLocaleDateString('vi-VN');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cert.certificateCode}.pdf"`);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
    doc.pipe(res);
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    doc.fontSize(28).text('CHỨNG CHỈ HOÀN THÀNH KHÓA HỌC', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(16).text('Trung tâm Tin học - Ngoại ngữ', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(14).text('Chứng nhận học viên', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(24).text(cert.student.fullName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('đã hoàn thành khóa học', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).text(cert.course.name, { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(13).text(`Mã chứng chỉ: ${cert.certificateCode}`, { align: 'center' });
    doc.fontSize(13).text(`Ngày cấp: ${issued}`, { align: 'center' });
    doc.end();
  }
}
