import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private svc: StudentsService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.get(id); }
  @Post() @Roles('ADMIN', 'ACADEMIC') create(@Body() dto: any) { return this.svc.create(dto); }
  @Post('import-csv') @Roles('ADMIN', 'ACADEMIC') importCsv(@Body() b: { csv: string }) { return this.svc.importCsv(b.csv || ''); }
  @Put(':id') @Roles('ADMIN', 'ACADEMIC') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles('ADMIN') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
