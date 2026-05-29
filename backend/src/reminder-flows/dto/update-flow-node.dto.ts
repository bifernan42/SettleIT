import { PartialType } from '@nestjs/swagger';
import { CreateFlowNodeDto } from './create-flow-node.dto';

export class UpdateFlowNodeDto extends PartialType(CreateFlowNodeDto) {}
