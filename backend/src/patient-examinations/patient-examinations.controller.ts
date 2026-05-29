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
    summary: 'Register a patient examination — triggers the reminder flow',
    description: 'Creating a record here is the event that activates the configured reminder flow.',
  })
  @ApiResponse({ status: 201, description: 'PatientExamination created and flow triggered' })
  create(@Body() dto: CreatePatientExaminationDto) {
    return this.service.create(dto);
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
