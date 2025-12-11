// src/modules/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { MissionsService } from '../missions/missions.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,
    private readonly missionsService: MissionsService,
    private readonly usersService: UsersService,
  ) { }

  async validateMissionPayment(missionId: number) {
    const mission = await this.missionsService.findOne(missionId);
    if (!mission) throw new NotFoundException('Mission not found');

    await this.missionsService.update(missionId, {
      paymentValidated: true,
      paymentDate: new Date(),
    });

    const transaction = this.repo.create({
      amountGross: mission.totalCompanyCost,
      commission: mission.platformCommission,
      payoutToStudent: mission.totalStudentEarnings,
      paymentDate: new Date(),
      status: TransactionStatus.SUCCESS,
      mission,
    });

    return this.repo.save(transaction);
  }

  async getAll() {
    return this.repo.find({
      relations: ['mission', 'student'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const transactions = await this.repo.find();
    const totalPayout = transactions.reduce(
      (acc, t) => acc + Number(t.payoutToStudent),
      0,
    );
    const totalCommission = transactions.reduce(
      (acc, t) => acc + Number(t.commission),
      0,
    );
    return { totalPayout, totalCommission, count: transactions.length };
  }
}
