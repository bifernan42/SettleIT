import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';

@Injectable()
export class ExaminationsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateExaminationDto) {
    return this.prisma.examination.create({ data: dto });
  }

  findAll() {
    return this.prisma.examination.findMany();
  }

  findOne(id: string) {
    return this.prisma.examination.findUniqueOrThrow({ where: { id } });
  }

  update(id: string, dto: UpdateExaminationDto) {
    return this.prisma.examination.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.examination.delete({ where: { id } });
  }
}
