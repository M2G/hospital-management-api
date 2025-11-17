import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentDomain } from 'appointments/domain/appointment.domain';
import { User } from 'appointments/domain/appointment.entity';
import { IGetAllUserService } from 'appointments/interfaces/services/get.all.appointment.service.interface';

@Injectable()
export class GetAllDoctorService implements IGetAllUserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ){}

    async getAll(): Promise<AppointmentDomain[]> {
        return await this.userRepository.find()
    }
}
