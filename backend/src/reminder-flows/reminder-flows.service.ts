import { BadRequestException, Injectable } from '@nestjs/common';
import { FlowNodeType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateReminderFlowDto } from './dto/create-reminder-flow.dto';
import { UpdateReminderFlowDto } from './dto/update-reminder-flow.dto';
import { CreateFlowNodeDto } from './dto/create-flow-node.dto';
import { UpdateFlowNodeDto } from './dto/update-flow-node.dto';
import { CreateFlowEdgeDto } from './dto/create-flow-edge.dto';
import { UpdateFlowEdgeDto } from './dto/update-flow-edge.dto';

@Injectable()
export class ReminderFlowsService {
  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {}

  // A DELAY node must respect the policy floor — otherwise a flow could wait
  // less than the minimum allowed gap between two reminder actions.
  private async assertDelayWithinPolicy(settings: Record<string, unknown>) {
    const delayDays = settings?.delayDays;
    if (typeof delayDays !== 'number') return;
    const { minDelayDays } = await this.settings.getPolicy();
    if (delayDays < minDelayDays) {
      throw new BadRequestException(
        `Le délai d'un nœud DELAY doit être d'au moins ${minDelayDays} jours (reçu : ${delayDays}).`,
      );
    }
  }

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

  async createNode(flowId: string, dto: CreateFlowNodeDto) {
    if (dto.type === FlowNodeType.DELAY) {
      await this.assertDelayWithinPolicy(dto.settings);
    }
    return this.prisma.flowNode.create({
      data: { ...dto, flowId, settings: dto.settings as Prisma.InputJsonValue },
    });
  }

  findNodes(flowId: string) {
    return this.prisma.flowNode.findMany({ where: { flowId } });
  }

  async updateNode(nodeId: string, dto: UpdateFlowNodeDto) {
    if (dto.settings) {
      const node = await this.prisma.flowNode.findUniqueOrThrow({
        where: { id: nodeId },
      });
      const type = dto.type ?? node.type;
      if (type === FlowNodeType.DELAY) {
        await this.assertDelayWithinPolicy(dto.settings);
      }
    }
    return this.prisma.flowNode.update({
      where: { id: nodeId },
      data: dto as unknown as Prisma.FlowNodeUpdateInput,
    });
  }

  removeNode(nodeId: string) {
    return this.prisma.flowNode.delete({ where: { id: nodeId } });
  }

  // ─── Edges ───────────────────────────────────────────────────────────────

  async createEdge(flowId: string, dto: CreateFlowEdgeDto) {
    // Guard: both nodes must belong to this flow, otherwise we'd silently
    // create a cross-flow edge which would corrupt the graph.
    const [source, target] = await Promise.all([
      this.prisma.flowNode.findUnique({ where: { id: dto.sourceNodeId } }),
      this.prisma.flowNode.findUnique({ where: { id: dto.targetNodeId } }),
    ]);

    if (!source || source.flowId !== flowId) {
      throw new BadRequestException(
        `sourceNodeId "${dto.sourceNodeId}" does not belong to flow "${flowId}".`,
      );
    }
    if (!target || target.flowId !== flowId) {
      throw new BadRequestException(
        `targetNodeId "${dto.targetNodeId}" does not belong to flow "${flowId}".`,
      );
    }

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
