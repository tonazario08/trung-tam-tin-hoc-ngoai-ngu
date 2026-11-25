import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })], controllers: [CoursesController], providers: [CoursesService] })
export class CoursesModule {}
