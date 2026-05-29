import { ApiProperty } from '@nestjs/swagger';

export class CreateReminderFlowDto {
  @ApiProperty({ example: 'Standard 30-day reminder' })
  name: string;
}
