import { Injectable, Inject } from '@nestjs/common';
import DoctorDomain from '@doctors/domain/doctor.domain';
import ICreateDoctorApplication from '@doctors/interfaces/applications/create.doctor.application.interface';
import { DOCTOR_TYPES } from '@doctors/interfaces/types';
import ICreateDoctorService from '@doctors/interfaces/services/create.doctor.service.interface';

@Injectable()
export class CreateDoctorApplication implements ICreateDoctorApplication {
    constructor(@Inject(DOCTOR_TYPES.services.ICreateDoctorService) private doctorService: ICreateDoctorService) {}

    async create(doctor: DoctorDomain): Promise<DoctorDomain> {
        return this.doctorService.create(doctor);
    }
}
