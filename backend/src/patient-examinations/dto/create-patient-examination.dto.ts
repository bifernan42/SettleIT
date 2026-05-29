import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientExaminationDto {
  @ApiProperty()
  patientId: string;

  @ApiProperty()
  examinationId: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-05-29T10:00:00.000Z' })
  date: string;
}
