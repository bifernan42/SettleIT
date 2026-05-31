import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePolicyDto {
  @ApiPropertyOptional({
    example: 7,
    minimum: 1,
    maximum: 30,
    description:
      'Minimum number of days between two reminder actions (also the re-contact cooldown).',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  minDelayDays?: number;

  @ApiPropertyOptional({
    example: 730,
    minimum: 30,
    maximum: 1825,
    description:
      'Maximum age (in days) of a visit beyond which a patient can no longer be contacted.',
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(1825)
  maxVisitAgeDays?: number;
}
