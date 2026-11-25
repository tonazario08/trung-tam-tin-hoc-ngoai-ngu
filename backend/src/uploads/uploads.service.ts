import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/** Thu muc luu file upload (tuong doi theo thu muc chay backend). */
export const UPLOAD_DIR = './backend/uploads';
export const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

@Injectable()
export class UploadsService {
  constructor() {
    // Tu tao thu muc neu chua co.
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  /** Duong dan tuyet doi cua 1 file da upload, null neu ten file khong hop le. */
  resolvePath(filename: string): string | null {
    const safe = path.basename(filename);
    if (!safe || safe !== filename) return null;
    return path.resolve(UPLOAD_DIR, safe);
  }

  /** Kiem tra dinh dang file cho phep (anh jpg/jpeg/png/webp va pdf). */
  static isAllowed(file: Express.Multer.File): boolean {
    const ext = path.extname(file.originalname).toLowerCase();
    return ALLOWED_EXTS.includes(ext);
  }

  toResponse(file: Express.Multer.File) {
    // main.ts dat global prefix 'api' nen duong dan thuc te la /api/uploads/...
    return {
      url: `/api/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }
}

/** File filter dung cho Multer: chi cho anh jpg/jpeg/png/webp va pdf, khac thi 400. */
export function uploadFileFilter(_req: any, file: Express.Multer.File, cb: (err: any, accept: boolean) => void) {
  if (UploadsService.isAllowed(file)) return cb(null, true);
  cb(new BadRequestException('Chi cho phep file anh (jpg, jpeg, png, webp) hoac PDF'), false);
}
