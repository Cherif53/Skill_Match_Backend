// src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MissionsModule } from '../missions/missions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), MissionsModule, UsersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
