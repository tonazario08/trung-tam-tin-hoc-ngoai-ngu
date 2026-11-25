import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })], controllers: [GradesController], providers: [GradesService] })
export class GradesModule {}
