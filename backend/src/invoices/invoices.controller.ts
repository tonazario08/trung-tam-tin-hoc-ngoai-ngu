import { Controller, Get, Post, Param, Query, Body, Req, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
@Controller('invoices') @UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private svc: InvoicesService) {}
  @Get() list(@Query() q: any) { return this.svc.list(q); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.get(id); }
  @Post(':id/payments') @Roles('ADMIN', 'ACADEMIC') pay(@Param('id') id: string, @Body() dto: any, @Req() req: any) { return this.svc.pay(id, dto, req.user.sub); }
}
