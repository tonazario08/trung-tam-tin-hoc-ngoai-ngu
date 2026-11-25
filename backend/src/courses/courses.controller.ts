import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller() @UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private svc: CoursesService) {}
  @Get('courses') list(@Query() q: any) { return this.svc.list(q); }
  @Post('courses') @Roles('ADMIN', 'ACADEMIC') create(@Body() dto: any) { return this.svc.create(dto); }
  @Put('courses/:id') @Roles('ADMIN', 'ACADEMIC') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Delete('courses/:id') @Roles('ADMIN') remove(@Param('id') id: string) { return this.svc.remove(id); }
  @Get('rooms') rooms() { return this.svc.rooms(); }
  @Post('rooms') @Roles('ADMIN', 'ACADEMIC') createRoom(@Body() dto: any) { return this.svc.createRoom(dto); }
}
