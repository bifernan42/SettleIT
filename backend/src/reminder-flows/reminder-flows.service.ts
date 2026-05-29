import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderFlowDto } from './dto/create-reminder-flow.dto';
import { UpdateReminderFlowDto } from './dto/update-reminder-flow.dto';
import { CreateFlowNodeDto } from './dto/create-flow-node.dto';
import { UpdateFlowNodeDto } from './dto/update-flow-node.dto';
import { CreateFlowEdgeDto } from './dto/create-flow-edge.dto';
import { UpdateFlowEdgeDto } from './dto/update-flow-edge.dto';

@Injectable()
export class ReminderFlowsService {
  constructor(private prisma: PrismaService) {}

  // ─── Flows ───────────────────────────────────────────────────────────────

  create(dto: CreateReminderFlowDto) {
    return this.prisma.reminderFlow.create({ data: dto });
  }

  findAll() {
    return this.prisma.reminderFlow.findMany();
  }

  findOne(id: string) {
    return this.prisma.reminderFlow.findUniqueOrThrow({
      where: { id },
      include: { nodes: { include: { outgoingEdges: true } } },
    });
  }

  update(id: string, dto: UpdateReminderFlowDto) {
    return this.prisma.reminderFlow.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.reminderFlow.delete({ where: { id } });
  }

  // ─── Nodes ───────────────────────────────────────────────────────────────

  createNode(flowId: string, dto: CreateFlowNodeDto) {
    return this.prisma.flowNode.create({
      data: { ...dto, flowId, settings: dto.settings as Prisma.InputJsonValue },
    });
  }

  findNodes(flowId: string) {
    return this.prisma.flowNode.findMany({ where: { flowId } });
  }

  updateNode(nodeId: string, dto: UpdateFlowNodeDto) {
    return this.prisma.flowNode.update({
      where: { id: nodeId },
      data: dto as unknown as Prisma.FlowNodeUpdateInput,
    });
  }

  removeNode(nodeId: string) {
    return this.prisma.flowNode.delete({ where: { id: nodeId } });
  }

  // ─── Edges ───────────────────────────────────────────────────────────────

  createEdge(flowId: string, dto: CreateFlowEdgeDto) {
    return this.prisma.flowEdge.create({ data: dto });
  }

  findEdges(flowId: string) {
    return this.prisma.flowEdge.findMany({
      where: { sourceNode: { flowId } },
    });
  }

  updateEdge(edgeId: string, dto: UpdateFlowEdgeDto) {
    return this.prisma.flowEdge.update({ where: { id: edgeId }, data: dto });
  }

  removeEdge(edgeId: string) {
    return this.prisma.flowEdge.delete({ where: { id: edgeId } });
  }
}
