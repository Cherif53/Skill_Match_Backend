import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission, MissionStatus } from './mission.entity';
import { CreateMissionDto } from '../auth/dto/create-mission.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepo: Repository<Mission>,
    private readonly usersService: UsersService,
  ) {}

  private calculateHours(startHour: string, endHour: string): number {
    const [sh, sm] = startHour.split(':').map(Number);
    const [eh, em] = endHour.split(':').map(Number);
    const diff = (eh * 60 + em - (sh * 60 + sm)) / 60;
    return Math.max(diff, 0);
  }

  async createMission(companyId: number, dto: CreateMissionDto): Promise<Mission> {
    const company = await this.usersService.findOne(companyId);
    if (!company) throw new NotFoundException('Entreprise introuvable');

    // Calcul automatique basé sur 16 €/h/étudiant et commission 30 %
    const hours = this.calculateHours(dto.startHour, dto.endHour);
    const rate = 16; // fixe
    const totalStudentEarnings = rate * hours * dto.studentCount;
    const platformCommission = totalStudentEarnings * 0.3;
    const totalCompanyCost = totalStudentEarnings + platformCommission;

    const mission = this.missionsRepo.create({
      ...dto,
      company,
      hourlyRate: rate,
      totalStudentEarnings,
      platformCommission,
      totalCompanyCost,
      status: MissionStatus.PENDING,
    });

    return this.missionsRepo.save(mission);
  }

  async findAll(): Promise<Mission[]> {
    return this.missionsRepo.find({
      relations: ['company', 'assignedStudents', 'applicants'],
      order: { createdAt: 'DESC' },
    });
  }

  async assignStudentByEmail(missionId: number, studentEmail: string): Promise<Mission> {
    const mission = await this.missionsRepo.findOne({
      where: { id: missionId },
      relations: ['assignedStudents'],
    });
    if (!mission) throw new NotFoundException('Mission non trouvée');

    const student = await this.usersService.findByEmail(studentEmail);
    if (!student) throw new NotFoundException('Étudiant introuvable');

    mission.assignedStudents.push(student);
    mission.status = MissionStatus.STAFFED;
    return this.missionsRepo.save(mission);
  }

  async unassignStudentByEmail(missionId: number, studentEmail: string): Promise<Mission> {
    const mission = await this.missionsRepo.findOne({
      where: { id: missionId },
      relations: ['assignedStudents'],
    });
    if (!mission) throw new NotFoundException('Mission non trouvée');

    mission.assignedStudents = mission.assignedStudents.filter(
      (s) => s.email !== studentEmail,
    );
    return this.missionsRepo.save(mission);
  }

  async updateStatus(id: number, status: MissionStatus): Promise<Mission> {
    const mission = await this.missionsRepo.findOne({ where: { id } });
    if (!mission) throw new NotFoundException('Mission non trouvée');

    mission.status = status;
    return this.missionsRepo.save(mission);
  }

  async deleteMission(id: number): Promise<void> {
    await this.missionsRepo.delete(id);
  }
}
