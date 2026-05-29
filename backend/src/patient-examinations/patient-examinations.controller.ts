import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePatientExaminationDto } from './dto/create-patient-examination.dto';
import { UpdatePatientExaminationDto } from './dto/update-patient-examination.dto';
import { PatientExaminationsService } from './patient-examinations.service';

@ApiTags('patient-examinations')
@Controller('patient-examinations')
export class PatientExaminationsController {
  constructor(private readonly service: PatientExaminationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Register a patient examination',
    description:
      'Persists the examination record. This is the intended trigger point for the ' +
      'reminder flow engine (not yet implemented): once the engine exists, registering ' +
      'a PatientExamination here will automatically launch the active ReminderFlow.',
  })
  @ApiResponse({ status: 201, description: 'PatientExamination created' })
  create(@Body() dto: CreatePatientExaminationDto) {
    return this.service.create(dto);
    // TODO: emit a domain event here once the flow engine is implemented.
    // The active ReminderFlow (isActive = true) should be resolved and its
    // TRIGGER node executed, which will produce the first PaymentRequest.
  }

  @Get()
  @ApiOperation({ summary: 'List all patient examinations' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a patient examination',
    description: 'Returns the record with computed `outOfPocketCost` = baseCost × (1 − coverageRate).',
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient examination' })
  update(@Param('id') id: string, @Body() dto: UpdatePatientExaminationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient examination' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
