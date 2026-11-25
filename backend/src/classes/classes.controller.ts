import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('classes') @UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private svc: ClassesService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Get('schedule/week') week(@Query() q: any) { return this.svc.weekSchedule(q); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.get(id); }
  @Post() @Roles('ADMIN', 'ACADEMIC') create(@Body() dto: any) { return this.svc.create(dto); }
  @Put(':id') @Roles('ADMIN', 'ACADEMIC') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Post(':id/schedules') @Roles('ADMIN', 'ACADEMIC') addSchedule(@Param('id') id: string, @Body() dto: any) { return this.svc.addSchedule(id, dto); }
}
