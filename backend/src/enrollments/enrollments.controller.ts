import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('enrollments') @UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private svc: EnrollmentsService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Post() @Roles('ADMIN', 'ACADEMIC') enroll(@Body() dto: any) { return this.svc.enroll(dto); }
  @Put(':id/status') @Roles('ADMIN', 'ACADEMIC') updateStatus(@Param('id') id: string, @Body() b: { status: string }) { return this.svc.updateStatus(id, b.status); }
}
