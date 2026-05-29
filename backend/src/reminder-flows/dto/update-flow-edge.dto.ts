import { PartialType } from '@nestjs/swagger';
import { CreateFlowEdgeDto } from './create-flow-edge.dto';

export class UpdateFlowEdgeDto extends PartialType(CreateFlowEdgeDto) {}
