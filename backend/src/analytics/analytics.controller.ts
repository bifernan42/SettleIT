import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Business metrics: money recovered/due per flow and per channel, fulfillment rates',
  })
  summary() {
    return this.service.summary();
  }
}
