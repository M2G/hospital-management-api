import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'appointments/domain/appointment.entity';

@Injectable()
export class DeleteDoctorService {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ){}

    async remove(id: string): Promise<{deleted: boolean}> {
        await this.userRepository.delete({userId: id})
        return {deleted: true}
    }
}
