import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('policy')
  @ApiOperation({ summary: 'Get the reminder policy (business rules)' })
  getPolicy() {
    return this.service.getPolicy();
  }

  @Patch('policy')
  @ApiOperation({ summary: 'Update the reminder policy (business rules)' })
  updatePolicy(@Body() dto: UpdatePolicyDto) {
    return this.service.updatePolicy(dto);
  }
}
