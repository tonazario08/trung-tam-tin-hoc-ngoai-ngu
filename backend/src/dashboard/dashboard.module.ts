import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CacheModule } from '../cache/cache.module';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' }), CacheModule], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
