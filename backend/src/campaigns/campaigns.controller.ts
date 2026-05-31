import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Get('eligibility')
  @ApiOperation({
    summary:
      'List patients with their reminder eligibility (visit age + re-contact cooldown)',
  })
  eligibility() {
    return this.service.eligibility();
  }
}
