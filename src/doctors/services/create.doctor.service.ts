import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@doctors/domain/doctor.entity';
import { DoctorDomain } from '@doctors/domain/doctor.domain';
import { ICreateUserService } from '@doctors/interfaces/services/create.doctor.service.interface';

@Injectable()
export class CreateDoctorService implements ICreateUserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async create(user: DoctorDomain): Promise<DoctorDomain> {
        return this.usersRepository.save(user);
    }
}
