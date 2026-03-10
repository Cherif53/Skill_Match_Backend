import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/user.entity';
import { Document } from '../documents/document.entity';
import { UsersModule } from 'src/users/users.module';
import { Mission } from 'src/missions/mission.entity';
import { Transaction } from 'src/payments/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Document, Mission, Transaction]),
    UsersModule,
],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
