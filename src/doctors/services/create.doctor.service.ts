import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/patient.entity';
import { PatientDomain } from '../domain/patient.domain';
import { ICreateUserService } from '../interfaces/services/create.patient.service.interface';

@Injectable()
export class CreateUserService implements ICreateUserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async create(user: PatientDomain): Promise<PatientDomain> {
        return this.usersRepository.save(user);
    }
}
