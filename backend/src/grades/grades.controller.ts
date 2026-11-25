import { Controller, Get, Post, Query, Body, Req, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('grades') @UseGuards(JwtAuthGuard)
export class GradesController {
  constructor(private svc: GradesService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Post() @Roles('ADMIN', 'ACADEMIC', 'TEACHER') create(@Body() dto: any, @Req() req: any) { return this.svc.create(dto, req.user.sub); }
}
