import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import PartialDoctor from '@doctors/domain/partial.doctor.domain';
import DoctorDomain from '@doctors/domain/doctor.domain';
import Doctor from '@doctors/domain/doctor.entity';

@Injectable()
export default class EditDoctorService {
    constructor(
        @InjectModel(Doctor) private doctorRepository: typeof Doctor,
    ){}

    async update(id: string, data: PartialDoctor): Promise<any> {
        await this.doctorRepository.update({userId: id}, data as any)
       // return await this.userRepository.findOne({userId: id})
    }
}
