// src/modules/payments/payments.controller.ts
import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('ADMIN')
  @Post('validate/:missionId')
  validate(@Param('missionId') missionId: number) {
    return this.paymentsService.validateMissionPayment(missionId);
  }

  @Roles('ADMIN')
  @Get()
  getAll() {
    return this.paymentsService.getAll();
  }

  @Roles('ADMIN')
  @Get('stats')
  getStats() {
    return this.paymentsService.getStats();
  }
}
