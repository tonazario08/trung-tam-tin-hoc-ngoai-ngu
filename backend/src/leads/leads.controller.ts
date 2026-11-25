import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private svc: LeadsService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.get(id); }
  @Post() @Roles('ADMIN', 'ACADEMIC') create(@Body() dto: any) { return this.svc.create(dto); }
  @Post(':id/convert') @Roles('ADMIN', 'ACADEMIC') convert(@Param('id') id: string) { return this.svc.convert(id); }
  @Put(':id') @Roles('ADMIN', 'ACADEMIC') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles('ADMIN') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
