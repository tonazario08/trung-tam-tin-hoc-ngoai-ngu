import { Controller, Get, Post, Param, Res, UseGuards, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { UploadsService, uploadFileFilter } from './uploads.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';

@Controller('uploads')
export class UploadsController {
  constructor(private svc: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'ACADEMIC', 'TEACHER')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './backend/uploads',
        filename: (_req, file, cb) =>
          cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + extname(file.originalname)),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: uploadFileFilter,
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new NotFoundException('Khong co file duoc upload');
    return this.svc.toResponse(file);
  }

  // KHONG dung guard cho GET file de <img> / link truc tiep hien thi duoc.
  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() res: any) {
    const fullPath = this.svc.resolvePath(filename);
    if (!fullPath || !fs.existsSync(fullPath)) return res.status(404).json({ message: 'Khong tim thay file' });
    return res.sendFile(fullPath);
  }
}
