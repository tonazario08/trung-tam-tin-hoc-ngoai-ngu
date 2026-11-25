import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CacheModule } from '../cache/cache.module';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' }), NotificationsModule, CacheModule], controllers: [InvoicesController], providers: [InvoicesService] })
export class InvoicesModule {}
