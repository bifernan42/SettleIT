import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePolicyDto } from './dto/update-policy.dto';

const POLICY_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // The policy is a singleton: upsert guarantees it exists with defaults on first read.
  getPolicy() {
    return this.prisma.reminderPolicy.upsert({
      where: { id: POLICY_ID },
      update: {},
      create: { id: POLICY_ID },
    });
  }

  updatePolicy(dto: UpdatePolicyDto) {
    return this.prisma.reminderPolicy.upsert({
      where: { id: POLICY_ID },
      update: dto,
      create: { id: POLICY_ID, ...dto },
    });
  }
}
