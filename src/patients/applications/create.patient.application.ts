import { Injectable, Inject } from '@nestjs/common';
import PatientDomain from '@patients/domain/patient.domain';
import ICreatePatientApplication from '@patients/interfaces/applications/create.patient.application.interface';
import { PATIENT_TYPES } from '@patients/interfaces/types';
import ICreatePatientService from '@patients/interfaces/services/create.patient.service.interface';

@Injectable()
export default class CreatePatientApplication implements ICreatePatientApplication {
    constructor(@Inject(PATIENT_TYPES.services.ICreatePatientService) private userService: ICreatePatientService) {}

    async create(user: PatientDomain): Promise<PatientDomain> {
        return this.userService.create(user);
    }
}
