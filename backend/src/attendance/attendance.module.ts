import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })], controllers: [AttendanceController], providers: [AttendanceService] })
export class AttendanceModule {}
