import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Doctor from '@doctors/domain/doctor.entity';
import DoctorDomain from '@doctors/domain/doctor.domain';
import IGetDomainService from '@doctors/interfaces/services/get.doctor.service.interface';

@Injectable()
export default class GetDoctorService implements IGetDomainService {
    constructor(@InjectModel(Doctor) private usersRepository: typeof Doctor) {}

    async getById(id: string): Promise<DoctorDomain> {
        return this.usersRepository.findOne({ userId: id });
    }
}
