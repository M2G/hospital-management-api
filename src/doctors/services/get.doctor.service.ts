import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/patient.entity';
import { PatientDomain } from '../domain/patient.domain';
import { IGetUserService } from '../interfaces/services/get.patient.service.interface';

@Injectable()
export class GetUserService implements IGetUserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async getById(id: string): Promise<PatientDomain> {
        return this.usersRepository.findOne({ userId: id });
    }
}
