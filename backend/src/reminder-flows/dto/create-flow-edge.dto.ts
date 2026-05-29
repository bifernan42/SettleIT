import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EdgeConditionType } from '@prisma/client';

export class CreateFlowEdgeDto {
  @ApiProperty()
  sourceNodeId: string;

  @ApiProperty()
  targetNodeId: string;

  @ApiPropertyOptional({
    enum: EdgeConditionType,
    default: EdgeConditionType.DEFAULT,
    description: 'Branch selector; condition params live in the source CONDITION node settings',
  })
  conditionType?: EdgeConditionType;
}
