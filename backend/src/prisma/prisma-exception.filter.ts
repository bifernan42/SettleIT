/**
 * PrismaExceptionFilter
 *
 * Translates known Prisma runtime errors into proper HTTP responses so that
 * controllers never accidentally leak a raw 500 for a routine not-found or
 * constraint violation.
 *
 * Mapped codes:
 *   P2025 — record not found (findUniqueOrThrow / update / delete on missing id) → 404
 *   P2003 — foreign key constraint failed (e.g. unknown patientId on create)    → 400
 *
 * Any other PrismaClientKnownRequestError is left to NestJS's default handler
 * (results in a 500 with the Prisma error code in the message for debugging).
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2025':
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'The requested record does not exist.',
        });
        break;

      case 'P2003':
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: `Foreign key constraint failed on field: ${String(exception.meta?.['field_name'] ?? 'unknown')}.`,
        });
        break;

      default:
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: `Database error [${exception.code}].`,
        });
    }
  }
}
