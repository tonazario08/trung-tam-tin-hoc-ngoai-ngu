import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
@Controller('dashboard') @UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private svc: DashboardService) {}
  @Get('overview') overview() { return this.svc.overview(); }
}
