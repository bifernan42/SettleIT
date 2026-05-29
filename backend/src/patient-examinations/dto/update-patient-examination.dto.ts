import { PartialType } from '@nestjs/swagger';
import { CreatePatientExaminationDto } from './create-patient-examination.dto';

export class UpdatePatientExaminationDto extends PartialType(CreatePatientExaminationDto) {}
