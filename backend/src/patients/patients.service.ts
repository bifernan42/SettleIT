import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePatientDto) {
    return this.prisma.patient.create({ data: dto });
  }

  findAll() {
    return this.prisma.patient.findMany();
  }

  findOne(id: string) {
    return this.prisma.patient.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, dto: UpdatePatientDto) {
    return this.prisma.patient.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.patient.delete({ where: { id } });
  }
}
