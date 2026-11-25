import { Controller, Get, Post, Param, Query, Body, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificatesController {
  constructor(private svc: CertificatesService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Get(':id/pdf') pdf(@Param('id') id: string, @Res() res: Response) { return this.svc.pdf(id, res); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.get(id); }
  @Post() @Roles('ADMIN', 'ACADEMIC') create(@Body() dto: any) { return this.svc.create(dto); }
  @Post(':id/issue') @Roles('ADMIN', 'ACADEMIC') issue(@Param('id') id: string) { return this.svc.issue(id); }
}
