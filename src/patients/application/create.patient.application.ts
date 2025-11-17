import { Injectable, Inject } from '@nestjs/common';
import { PatientDomain } from '../domain/patient.domain';
import { ICreateUserApplication } from '../interfaces/applications/create.patient.application.interface';
import { USER_TYPES } from '../interfaces/types';
import { ICreateUserService } from '../interfaces/services/create.patient.service.interface';

@Injectable()
export class CreatePatientApplication implements ICreateUserApplication {
    constructor(@Inject(USER_TYPES.services.ICreateUserService) private userService: ICreateUserService) {}

    async create(user: PatientDomain): Promise<PatientDomain> {
        return this.userService.create(user);
    }
}
