import { Module } from '@nestjs/common';
import { ReminderFlowsController } from './reminder-flows.controller';
import { FlowNodesController } from './flow-nodes.controller';
import { FlowEdgesController } from './flow-edges.controller';
import { ReminderFlowsService } from './reminder-flows.service';

@Module({
  controllers: [ReminderFlowsController, FlowNodesController, FlowEdgesController],
  providers: [ReminderFlowsService],
})
export class ReminderFlowsModule {}
