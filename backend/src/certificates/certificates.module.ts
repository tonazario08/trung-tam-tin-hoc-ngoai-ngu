import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'thay-doi-secret-nay-trong-production' })], controllers: [CertificatesController], providers: [CertificatesService], exports: [CertificatesService] })
export class CertificatesModule {}
