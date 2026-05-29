import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientExaminationDto } from './dto/create-patient-examination.dto';
import { UpdatePatientExaminationDto } from './dto/update-patient-examination.dto';

@Injectable()
export class PatientExaminationsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePatientExaminationDto) {
    return this.prisma.patientExamination.create({
      data: { ...dto, date: new Date(dto.date) },
      include: { patient: true, examination: true },
    });
  }

  async findAll() {
    const records = await this.prisma.patientExamination.findMany({
      include: { patient: true, examination: true },
    });
    // Compute outOfPocketCost consistently with findOne — never store it,
    // always derive it so changes to coverageRate are immediately reflected.
    return records.map((pe) => ({
      ...pe,
      outOfPocketCost: pe.examination.baseCost * (1 - pe.patient.coverageRate),
    }));
  }

  async findOne(id: string) {
    const pe = await this.prisma.patientExamination.findUniqueOrThrow({
      where: { id },
      include: { patient: true, examination: true },
    });
    return {
      ...pe,
      outOfPocketCost: pe.examination.baseCost * (1 - pe.patient.coverageRate),
    };
  }

  update(id: string, dto: UpdatePatientExaminationDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.patientExamination.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.patientExamination.delete({ where: { id } });
  }
}
