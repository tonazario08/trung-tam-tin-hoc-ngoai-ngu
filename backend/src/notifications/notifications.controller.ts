import { Controller, Get, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  list(@Query() q: any, @Req() req: any) {
    return this.svc.listForUser(req.user.sub, q);
  }

  @Get('unread-count')
  unreadCount(@Req() req: any) {
    return this.svc.unreadCount(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.svc.markRead(id, req.user.sub);
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    return this.svc.markAllRead(req.user.sub);
  }
}
