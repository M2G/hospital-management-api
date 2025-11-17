import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartialUser } from 'appointments/domain/partial.appointment.domain';
import { AppointmentDomain } from 'appointments/domain/appointment.domain';
import { User } from 'appointments/domain/appointment.entity';

@Injectable()
export class EditDoctorService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ){}

    async update(id: string, data: PartialUser): Promise<AppointmentDomain> {
        await this.userRepository.update({userId: id}, data)
        return await this.userRepository.findOne({userId: id})
    }
}
