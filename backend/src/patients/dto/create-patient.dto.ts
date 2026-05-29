import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Jean' })
  name: string;

  @ApiProperty({ example: 'Dupont' })
  surname: string;

  @ApiProperty({ example: '+33 6 12 34 56 78' })
  phoneNumber: string;

  @ApiProperty({ example: 'jean.dupont@email.com' })
  email: string;

  @ApiProperty({ example: '12 rue de la Paix, 75001 Paris' })
  address: string;

  @ApiProperty({ minimum: 0, maximum: 1, example: 0.7, description: 'Insurance coverage rate (0–1)' })
  coverageRate: number;
}
