import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './mission.entity';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { AdminMissionsController } from './admin-missions.controller';
import { UsersModule } from '../users/users.module';
import { MissionApplication } from './mission-application.entity';
import { MissionApplicationsService } from './mission-applications.service';
import { MissionApplicationsController } from './mission-applications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mission, MissionApplication]), UsersModule],
  providers: [MissionsService, MissionApplicationsService],
  controllers: [MissionsController, AdminMissionsController, MissionApplicationsController],
  exports: [MissionsService],
})
export class MissionsModule {}
