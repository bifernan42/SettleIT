import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateReminderFlowDto } from './dto/create-reminder-flow.dto';
import { UpdateReminderFlowDto } from './dto/update-reminder-flow.dto';
import { CreateFlowNodeDto } from './dto/create-flow-node.dto';
import { CreateFlowEdgeDto } from './dto/create-flow-edge.dto';
import { ReminderFlowsService } from './reminder-flows.service';

@ApiTags('reminder-flows')
@Controller('reminder-flows')
export class ReminderFlowsController {
  constructor(private readonly service: ReminderFlowsService) {}

  // ─── Flows ───────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a reminder flow' })
  @ApiResponse({ status: 201, description: 'Flow created' })
  create(@Body() dto: CreateReminderFlowDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all reminder flows' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a flow with its nodes and edges' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a flow' })
  update(@Param('id') id: string, @Body() dto: UpdateReminderFlowDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a flow' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ─── Nodes ───────────────────────────────────────────────────────────────

  @Post(':id/nodes')
  @ApiOperation({ summary: 'Add a node to a flow' })
  @ApiResponse({ status: 201, description: 'Node created' })
  createNode(@Param('id') flowId: string, @Body() dto: CreateFlowNodeDto) {
    return this.service.createNode(flowId, dto);
  }

  @Get(':id/nodes')
  @ApiOperation({ summary: 'List all nodes of a flow' })
  findNodes(@Param('id') flowId: string) {
    return this.service.findNodes(flowId);
  }

  // ─── Edges ───────────────────────────────────────────────────────────────

  @Post(':id/edges')
  @ApiOperation({ summary: 'Add an edge to a flow' })
  @ApiResponse({ status: 201, description: 'Edge created' })
  createEdge(@Param('id') flowId: string, @Body() dto: CreateFlowEdgeDto) {
    return this.service.createEdge(flowId, dto);
  }

  @Get(':id/edges')
  @ApiOperation({ summary: 'List all edges of a flow' })
  findEdges(@Param('id') flowId: string) {
    return this.service.findEdges(flowId);
  }
}
