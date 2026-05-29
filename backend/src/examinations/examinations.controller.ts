import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
import { ExaminationsService } from './examinations.service';

@ApiTags('examinations')
@Controller('examinations')
export class ExaminationsController {
  constructor(private readonly service: ExaminationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an examination type' })
  @ApiResponse({ status: 201, description: 'Examination created' })
  create(@Body() dto: CreateExaminationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all examination types' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an examination type' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an examination type' })
  update(@Param('id') id: string, @Body() dto: UpdateExaminationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an examination type' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
