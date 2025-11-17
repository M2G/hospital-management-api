import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'appointments/domain/appointment.entity';
import { AppointmentDomain } from 'appointments/domain/appointment.domain';
import { ICreateUserService } from 'appointments/interfaces/services/create.appointment.service.interface';

@Injectable()
export class CreateDoctorService implements ICreateUserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async create(user: AppointmentDomain): Promise<AppointmentDomain> {
        return this.usersRepository.save(user);
    }
}
