import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission, MissionStatus } from './mission.entity';
import { CreateMissionDto } from '../auth/dto/create-mission.dto';
import { UsersService } from '../users/users.service';
import { ApplicationStatus, MissionApplication } from './mission-application.entity';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionsRepo: Repository<Mission>,
    @InjectRepository(MissionApplication)
    private readonly missionAppRepo: Repository<MissionApplication>,
    private readonly usersService: UsersService,
  ) { }

  // ✅ Créer une mission (pour une entreprise)
  async createMission(companyId: number, dto: CreateMissionDto) {
    const company = await this.usersService.findOne(companyId);
    if (!company) throw new NotFoundException('Entreprise non trouvée');

    const start = new Date(`1970-01-01T${dto.startHour}:00`);
    const end = new Date(`1970-01-01T${dto.endHour}:00`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const hourlyRate = 16; // €
    const totalStudentEarnings = dto.studentCount * hourlyRate * hours;
    const platformCommission = totalStudentEarnings * 0.3;
    const totalCompanyCost = totalStudentEarnings + platformCommission;

    const mission = this.missionsRepo.create({
      ...dto,
      company,
      status: MissionStatus.PENDING,
      hourlyRate,
      totalStudentEarnings,
      platformCommission,
      totalCompanyCost,
    });

    return await this.missionsRepo.save(mission);
  }

  // ✅ Récupérer toutes les missions d'une entreprise connectée
  async findAll(companyId?: number) {
    const where = companyId ? { company: { id: companyId } } : {};

    return this.missionsRepo.find({
      where,
      relations: {
        company: true,
        students: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // 🧩 Trouver une mission par ID pour une entreprise donnée
  async findOne(id: number, companyId?: number): Promise<Mission> {
    const where = companyId
      ? { id, company: { id: companyId } }
      : { id };

    const mission = await this.missionsRepo.findOne({
      where,
      relations: ['company', 'students', 'applications'],
    });

    if (!mission) {
      throw new NotFoundException(`Mission avec ID ${id} introuvable`);
    }

    return mission;
  }

  // ✅ Récupérer les missions d’une entreprise
  async findByCompany(companyId: number) {
    return this.missionsRepo.find({
      where: { company: { id: companyId } },
      relations: { company: true, students: true },
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ Ajouter un étudiant à une mission (sans doublon)
  async assignStudent(missionId: number, studentId: number, companyId?: number) {
    const mission = companyId
      ? await this.getOwnedMissionOrFail(missionId, companyId)
      : await this.findOne(missionId);

    const student = await this.usersService.findOne(studentId);

    if (!student) throw new NotFoundException('Étudiant introuvable');
    if (!student.isActive) {
      throw new BadRequestException('Compte étudiant inactif');
    }

    const alreadyAssigned = mission.students.some((s) => s.id === student.id);
    if (alreadyAssigned) {
      throw new BadRequestException('Étudiant déjà assigné à cette mission');
    }

    mission.students.push(student);
    mission.status = MissionStatus.STAFFED;

    await this.missionsRepo.save(mission);

    return {
      message: `Étudiant ${student.firstName ?? student.email} assigné avec succès à la mission ${mission.title}`,
      missionId: mission.id,
      totalAssigned: mission.students.length,
    };
  }

  // ✅ Retirer un étudiant
  async unassignStudent(missionId: number, studentId: number, companyId?: number) {
    const mission = companyId
      ? await this.getOwnedMissionOrFail(missionId, companyId)
      : await this.findOne(missionId);

    const student = await this.usersService.findOne(studentId);

    if (!student) throw new NotFoundException('Étudiant introuvable');

    const before = mission.students.length;
    mission.students = mission.students.filter((s) => s.id !== student.id);

    if (mission.students.length === 0) {
      mission.status = MissionStatus.PENDING;
    }

    await this.missionsRepo.save(mission);

    return {
      message: `Étudiant ${student.email} retiré de la mission.`,
      before,
      after: mission.students.length,
    };
  }

  // ✅ Met à jour le statut d’une mission
  async updateMissionStatus(id: number, status: MissionStatus, companyId?: number) {
    const mission = companyId
      ? await this.getOwnedMissionOrFail(id, companyId)
      : await this.findOne(id);

    if (
      mission.status === MissionStatus.COMPLETED &&
      status === MissionStatus.PENDING
    ) {
      throw new BadRequestException(
        "Impossible de repasser une mission terminée en 'PENDING'.",
      );
    }

    const validTransitions: Record<MissionStatus, MissionStatus[]> = {
      [MissionStatus.PENDING]: [MissionStatus.STAFFED, MissionStatus.CANCELLED],
      [MissionStatus.STAFFED]: [MissionStatus.COMPLETED, MissionStatus.CANCELLED],
      [MissionStatus.COMPLETED]: [],
      [MissionStatus.CANCELLED]: [],
    };

    const allowed = validTransitions[mission.status].includes(status);
    if (!allowed && mission.status !== status) {
      throw new BadRequestException(
        `Transition de ${mission.status} vers ${status} non autorisée.`,
      );
    }

    mission.status = status;
    await this.missionsRepo.save(mission);

    return {
      message: `Statut de la mission '${mission.title}' mis à jour avec succès.`,
      id: mission.id,
      status: mission.status,
    };
  }

  async update(id: number, companyIdOrData: number | Partial<Mission>, maybeData?: Partial<Mission>) {
    let companyId: number | undefined;
    let data: Partial<Mission>;

    if (typeof companyIdOrData === 'number') {
      companyId = companyIdOrData;
      data = maybeData ?? {};
    } else {
      data = companyIdOrData;
    }

    const mission = companyId
      ? await this.findOne(id, companyId)
      : await this.findOne(id);

    if (!mission) throw new NotFoundException('Mission non trouvée');

    delete (data as any).students;
    delete (data as any).company;
    delete (data as any).applications;
    delete (data as any).transactions;
    delete (data as any).messages;

    const updatedMission = {
      ...mission,
      ...data,
    };

    const startHour = updatedMission.startHour;
    const endHour = updatedMission.endHour;
    const studentCount = updatedMission.studentCount;

    if (startHour && endHour && studentCount) {
      const hours = this.calculateHours(startHour, endHour);

      const hourlyRate = Number(updatedMission.hourlyRate ?? mission.hourlyRate ?? 16);
      const totalStudentEarnings = studentCount * hourlyRate * hours;
      const platformCommission = totalStudentEarnings * 0.3;
      const totalCompanyCost = totalStudentEarnings + platformCommission;

      updatedMission.hourlyRate = hourlyRate;
      updatedMission.totalStudentEarnings = totalStudentEarnings;
      updatedMission.platformCommission = platformCommission;
      updatedMission.totalCompanyCost = totalCompanyCost;
    }

    await this.missionsRepo.save(updatedMission);
    return companyId ? this.findOne(id, companyId) : this.findOne(id);
  }

  // ✅ Validation du paiement d’une mission complétée
  async validateMissionPayment(id: number, companyId?: number) {
    const mission = companyId
      ? await this.getOwnedMissionOrFail(id, companyId)
      : await this.findOne(id);

    if (mission.status !== MissionStatus.COMPLETED) {
      throw new BadRequestException(
        "Le paiement ne peut être validé que pour une mission terminée.",
      );
    }

    if (mission.paymentValidated) {
      throw new BadRequestException(
        'Le paiement est déjà validé pour cette mission.',
      );
    }

    const totalHours =
      this.calculateHours(mission.startHour, mission.endHour) * mission.studentCount;
    const totalStudentEarnings = totalHours * Number(mission.hourlyRate);
    const platformCommission = totalStudentEarnings * 0.3;
    const totalCompanyCost = totalStudentEarnings + platformCommission;

    mission.paymentValidated = true;
    mission.totalStudentEarnings = totalStudentEarnings;
    mission.platformCommission = platformCommission;
    mission.totalCompanyCost = totalCompanyCost;
    mission.paymentDate = new Date();

    await this.missionsRepo.save(mission);

    return {
      message: `✅ Paiement validé pour la mission "${mission.title}"`,
      missionId: mission.id,
      totalStudentEarnings,
      platformCommission,
      totalCompanyCost,
    };
  }

  // ✅ Petite fonction utilitaire pour calculer la durée entre deux heures
  private calculateHours(startHour: string, endHour: string): number {
    const [startH, startM] = startHour.split(':').map(Number);
    const [endH, endM] = endHour.split(':').map(Number);
    const total = (endH + endM / 60) - (startH + startM / 60);
    return total > 0 ? total : 0;
  }


  // ✅ Supprimer une mission appartenant à l'entreprise connectée
  async deleteMission(id: number, companyId?: number) {
    const mission = companyId
      ? await this.missionsRepo.findOne({
        where: { id, company: { id: companyId } },
      })
      : await this.missionsRepo.findOne({ where: { id } });

    if (!mission) throw new NotFoundException('Mission non trouvée');

    await this.missionsRepo.remove(mission);
    return { message: 'Mission supprimée avec succès' };
  }

  async applyToMission(missionId: number, studentId: number) {
    console.log('🟡 applyToMission start', { missionId, studentId });
    try {
      // 1. Récupérer la mission
      const mission = await this.missionsRepo.findOne({
        where: { id: missionId },
        relations: ['applications'],
      });

      if (!mission) {
        throw new NotFoundException('Mission introuvable');
      }

      // 2. Interdire certaines missions
      if (
        mission.status === MissionStatus.CANCELLED ||
        mission.status === MissionStatus.COMPLETED
      ) {
        throw new BadRequestException('Mission non disponible');
      }

      // 3. Vérifier que l’étudiant n’a pas déjà postulé
      const existing = await this.missionAppRepo.findOne({
        where: {
          mission: { id: missionId },
          student: { id: studentId },
        },
      });

      if (existing) {
        throw new BadRequestException('Vous avez déjà postulé à cette mission');
      }

      // 4. Créer la candidature
      const app = this.missionAppRepo.create({
        mission: { id: missionId } as any,
        student: { id: studentId } as any,
        status: ApplicationStatus.PENDING,
      });

      // 5. Sauvegarder
      const saved = await this.missionAppRepo.save(app);

      return saved;
    } catch (error) {
      console.error('❌ Error in applyToMission:', error);
      throw error;
    }
  }

  async getApplicationsForMission(missionId: number, companyId?: number) {
    if (companyId) {
      await this.getOwnedMissionOrFail(missionId, companyId);
    } else {
      await this.findOne(missionId);
    }

    return this.missionAppRepo.find({
      where: { mission: { id: missionId } },
      relations: ['student'],
      order: { appliedAt: 'ASC' },
    });
  }

  async staffMission(missionId: number, applicationIds: number[], companyId?: number) {
    const mission = companyId
      ? await this.getOwnedMissionOrFail(missionId, companyId)
      : await this.findOne(missionId);

    if (applicationIds.length > mission.studentCount) {
      throw new BadRequestException(
        `Vous ne pouvez pas sélectionner plus de ${mission.studentCount} étudiant(s).`,
      );
    }

    const allApps = await this.missionAppRepo.find({
      where: { mission: { id: missionId } },
      relations: ['student'],
    });

    const acceptedIds = new Set(applicationIds);

    mission.students = [];

    for (const app of allApps) {
      if (acceptedIds.has(app.id)) {
        app.status = ApplicationStatus.ACCEPTED;
        mission.students.push(app.student);
      } else if (app.status === ApplicationStatus.PENDING) {
        app.status = ApplicationStatus.REJECTED;
      }
    }

    mission.status = MissionStatus.STAFFED;

    await this.missionAppRepo.save(allApps);
    await this.missionsRepo.save(mission);

    return {
      missionId,
      acceptedCount: mission.students.length,
    };
  }

  // 🔹 Missions pour l'admin avec résumé candidatures
  async getAdminMissions() {
    const missions = await this.missionsRepo.find({
      relations: ['company', 'students', 'applications'],
      order: { date: 'ASC' },
    });

    return missions.map((m) => {
      const applications = m.applications ?? [];
      const applicationsCount = applications.length;
      const acceptedCount = applications.filter(
        (a) => a.status === ApplicationStatus.ACCEPTED,
      ).length;

      // on enlève la propriété applications pour ne pas renvoyer toute la liste
      const { applications: _removed, ...rest } = m;

      return {
        ...rest,
        applicationsCount,
        acceptedCount,
      };
    });
  }

  private async getOwnedMissionOrFail(missionId: number, companyId: number) {
    const mission = await this.missionsRepo.findOne({
      where: { id: missionId, company: { id: companyId } },
      relations: ['company', 'students', 'applications'],
    });

    if (!mission) {
      throw new NotFoundException('Mission introuvable');
    }

    return mission;
  }

  async acceptApplicant(missionId: number, studentId: number, companyId: number) {
    const mission = await this.getOwnedMissionOrFail(missionId, companyId);

    const application = await this.missionAppRepo.findOne({
      where: {
        mission: { id: mission.id },
        student: { id: studentId },
      },
      relations: ['student', 'mission'],
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable');
    }

    application.status = ApplicationStatus.ACCEPTED;

    const alreadyAssigned = mission.students.some((student) => student.id === studentId);
    if (!alreadyAssigned && application.student) {
      mission.students.push(application.student);
    }

    if (mission.students.length > 0) {
      mission.status = MissionStatus.STAFFED;
    }

    await this.missionAppRepo.save(application);
    await this.missionsRepo.save(mission);

    return {
      message: 'Candidature acceptée avec succès',
      missionId,
      studentId,
    };
  }

  async rejectApplicant(missionId: number, studentId: number, companyId: number) {
    const mission = await this.getOwnedMissionOrFail(missionId, companyId);

    const application = await this.missionAppRepo.findOne({
      where: {
        mission: { id: mission.id },
        student: { id: studentId },
      },
      relations: ['student', 'mission'],
    });

    if (!application) {
      throw new NotFoundException('Candidature introuvable');
    }

    application.status = ApplicationStatus.REJECTED;

    mission.students = mission.students.filter((student) => student.id !== studentId);

    if (mission.students.length === 0) {
      mission.status = MissionStatus.PENDING;
    }

    await this.missionAppRepo.save(application);
    await this.missionsRepo.save(mission);

    return {
      message: 'Candidature refusée avec succès',
      missionId,
      studentId,
    };
  }


}
