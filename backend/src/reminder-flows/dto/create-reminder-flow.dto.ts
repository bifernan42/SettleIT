import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReminderFlowDto {
  @ApiProperty({ example: 'Email puis SMS si absence de réponse' })
  name: string;

  @ApiPropertyOptional({
    default: false,
    description:
      'When true, this flow is the one that fires automatically when a new ' +
      'PatientExamination is registered. Only one flow should be active at a time.',
  })
  isActive?: boolean;
}
