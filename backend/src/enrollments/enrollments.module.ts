import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CacheModule } from '../cache/cache.module';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' }), NotificationsModule, CacheModule], controllers: [EnrollmentsController], providers: [EnrollmentsService] })
export class EnrollmentsModule {}
