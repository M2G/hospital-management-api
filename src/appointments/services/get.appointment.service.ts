import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'appointments/domain/appointment.entity';
import { AppointmentDomain } from 'appointments/domain/appointment.domain';
import { IGetUserService } from 'appointments/interfaces/services/get.appointment.service.interface';

@Injectable()
export class GetDoctorService implements IGetUserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    async getById(id: string): Promise<AppointmentDomain> {
        return this.usersRepository.findOne({ userId: id });
    }
}
