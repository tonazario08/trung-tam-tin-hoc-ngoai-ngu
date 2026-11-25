import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('attendance') @UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private svc: AttendanceService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Post('bulk') @Roles('ADMIN', 'ACADEMIC', 'TEACHER') bulk(@Body() dto: any) { return this.svc.bulk(dto); }
}
