import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PatientsModule } from './patients/patients.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { PatientExaminationsModule } from './patient-examinations/patient-examinations.module';
import { ReminderFlowsModule } from './reminder-flows/reminder-flows.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { SettingsModule } from './settings/settings.module';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  imports: [
    PrismaModule,
    PatientsModule,
    ExaminationsModule,
    PatientExaminationsModule,
    ReminderFlowsModule,
    PaymentRequestsModule,
    SettingsModule,
    CampaignsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
