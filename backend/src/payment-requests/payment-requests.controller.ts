import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentRequestStatus } from '@prisma/client';
import { PaymentRequestsService } from './payment-requests.service';

@ApiTags('payment-requests')
@Controller('payment-requests')
export class PaymentRequestsController {
  constructor(private readonly service: PaymentRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'List payment requests' })
  @ApiQuery({ name: 'status', enum: PaymentRequestStatus, required: false })
  findAll(@Query('status') status?: PaymentRequestStatus) {
    return this.service.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/fulfill')
  @ApiOperation({
    summary: 'Mark a payment request as fulfilled',
    description: 'Idempotent — safe to call on an already-fulfilled request.',
  })
  fulfill(@Param('id') id: string) {
    return this.service.fulfill(id);
  }
}
