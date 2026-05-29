import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateFlowNodeDto } from './dto/update-flow-node.dto';
import { ReminderFlowsService } from './reminder-flows.service';

@ApiTags('reminder-flows')
@Controller('flow-nodes')
export class FlowNodesController {
  constructor(private readonly service: ReminderFlowsService) {}

  @Patch(':nodeId')
  @ApiOperation({ summary: 'Update a flow node' })
  update(@Param('nodeId') nodeId: string, @Body() dto: UpdateFlowNodeDto) {
    return this.service.updateNode(nodeId, dto);
  }

  @Delete(':nodeId')
  @ApiOperation({ summary: 'Remove a flow node' })
  remove(@Param('nodeId') nodeId: string) {
    return this.service.removeNode(nodeId);
  }
}
