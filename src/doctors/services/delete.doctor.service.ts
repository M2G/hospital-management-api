import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Domain from '@doctors/domain/doctor.entity';

@Injectable()
export default class DeleteDoctorService {

    constructor(
        @InjectModel(Domain) private userRepository: typeof Domain
    ){}

    async remove(id: string): Promise<{deleted: boolean}> {
        await this.userRepository.delete({userId: id})
        return {deleted: true}
    }
}
