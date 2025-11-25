import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Doctor from '@doctors/domain/doctor.entity';
import DoctorDomain from '@doctors/domain/doctor.domain';
import ICreateDoctorService from '@doctors/interfaces/services/create.doctor.service.interface';

@Injectable()
export default class CreateDoctorService implements ICreateDoctorService {
    constructor(@InjectModel(Doctor) private doctorsRepository: typeof Doctor) {}

    async create(user: DoctorDomain): Promise<DoctorDomain> {
      return this.doctorsRepository.save(user);
    }
}
