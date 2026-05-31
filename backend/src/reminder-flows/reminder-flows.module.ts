import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { ReminderFlowsController } from './reminder-flows.controller';
import { FlowNodesController } from './flow-nodes.controller';
import { FlowEdgesController } from './flow-edges.controller';
import { ReminderFlowsService } from './reminder-flows.service';

@Module({
  imports: [SettingsModule],
  controllers: [ReminderFlowsController, FlowNodesController, FlowEdgesController],
  providers: [ReminderFlowsService],
})
export class ReminderFlowsModule {}
