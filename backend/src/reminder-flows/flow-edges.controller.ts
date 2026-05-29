import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateFlowEdgeDto } from './dto/update-flow-edge.dto';
import { ReminderFlowsService } from './reminder-flows.service';

@ApiTags('reminder-flows')
@Controller('flow-edges')
export class FlowEdgesController {
  constructor(private readonly service: ReminderFlowsService) {}

  @Patch(':edgeId')
  @ApiOperation({ summary: 'Update a flow edge' })
  update(@Param('edgeId') edgeId: string, @Body() dto: UpdateFlowEdgeDto) {
    return this.service.updateEdge(edgeId, dto);
  }

  @Delete(':edgeId')
  @ApiOperation({ summary: 'Remove a flow edge' })
  remove(@Param('edgeId') edgeId: string) {
    return this.service.removeEdge(edgeId);
  }
}
