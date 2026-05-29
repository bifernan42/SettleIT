import { ApiProperty } from '@nestjs/swagger';

export class CreateExaminationDto {
  @ApiProperty({ example: 150.0, description: 'Base cost before coverage (EUR)' })
  baseCost: number;
}
