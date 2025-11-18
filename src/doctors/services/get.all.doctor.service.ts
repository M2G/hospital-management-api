import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import DoctorDomain from '@doctors/domain/doctor.domain';
import IGetAllDoctorService from '@doctors/interfaces/services/get.all.doctor.service.interface';
import Doctor from '@doctors/domain/doctor.entity';

@Injectable()
export default class GetAllDoctorService implements IGetAllDoctorService {
    constructor(
        @InjectModel(Doctor) private userRepository: typeof Doctor
    ){}

    async getAll(): Promise<DoctorDomain[]> {
        return await this.userRepository.find()
    }
}
