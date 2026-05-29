import { Module } from '@nestjs/common';
import { PatientExaminationsController } from './patient-examinations.controller';
import { PatientExaminationsService } from './patient-examinations.service';

@Module({
  controllers: [PatientExaminationsController],
  providers: [PatientExaminationsService],
})
export class PatientExaminationsModule {}
