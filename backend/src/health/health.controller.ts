import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

// Public, khong guard: dung cho Docker healthcheck va load balancer.
@Controller('health')
export class HealthController {
  constructor(private health: HealthService) {}

  @Get()
  async check() {
    return this.health.check();
  }
}
