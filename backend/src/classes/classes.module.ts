import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })], controllers: [ClassesController], providers: [ClassesService] })
export class ClassesModule {}
