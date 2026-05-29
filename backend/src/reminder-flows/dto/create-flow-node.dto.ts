import { ApiProperty } from '@nestjs/swagger';
import { FlowNodeType } from '@prisma/client';

export class CreateFlowNodeDto {
  @ApiProperty({ enum: FlowNodeType, example: FlowNodeType.ACTION })
  type: FlowNodeType;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { templateId: 'email-reminder-1', delayDays: 7 },
    description: 'Node-type-specific configuration (action params, delay duration, condition expression…)',
  })
  settings: Record<string, unknown>;
}
