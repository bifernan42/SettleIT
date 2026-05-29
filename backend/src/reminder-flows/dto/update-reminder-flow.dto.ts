import { PartialType } from '@nestjs/swagger';
import { CreateReminderFlowDto } from './create-reminder-flow.dto';

export class UpdateReminderFlowDto extends PartialType(CreateReminderFlowDto) {}
