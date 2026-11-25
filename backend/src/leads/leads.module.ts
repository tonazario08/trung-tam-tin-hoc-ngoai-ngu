import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })], controllers: [LeadsController], providers: [LeadsService], exports: [LeadsService] })
export class LeadsModule {}
