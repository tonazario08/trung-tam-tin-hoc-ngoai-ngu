import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { UploadsController } from './uploads.controller';
import { UploadsService, UPLOAD_DIR } from './uploads.service';

// Tu tao thu muc upload khi module duoc khoi tao.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
