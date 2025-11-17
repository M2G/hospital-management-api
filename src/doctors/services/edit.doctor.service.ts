import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartialUser } from '../domain/partial.patient.domain';
import { PatientDomain } from '../domain/patient.domain';
import { User } from '../domain/patient.entity';

@Injectable()
export class EditUserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ){}

    async update(id: string, data: PartialUser): Promise<PatientDomain> {
        await this.userRepository.update({userId: id}, data)
        return await this.userRepository.findOne({userId: id})
    }
}
