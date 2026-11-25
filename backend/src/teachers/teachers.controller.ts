import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('teachers') @UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private svc: TeachersService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Post() @Roles('ADMIN', 'ACADEMIC') create(@Body() dto: any) { return this.svc.create(dto); }
  @Put(':id') @Roles('ADMIN', 'ACADEMIC') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles('ADMIN') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
