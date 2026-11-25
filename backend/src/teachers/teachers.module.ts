import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })], controllers: [TeachersController], providers: [TeachersService] })
export class TeachersModule {}
