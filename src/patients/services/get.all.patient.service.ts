import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientDomain } from '@patients/domain/patient.domain';
import { User } from '@patients/domain/patient.entity';
import { IGetAllUserService } from '@patients/interfaces/services/get.all.patient.service.interface';

@Injectable()
export class GetAllUserService implements IGetAllUserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ){}

    async getAll(): Promise<PatientDomain[]> {
        return await this.userRepository.find()
    }
}
