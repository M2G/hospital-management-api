import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PatientDomain } from '../domain/patient.domain';
import { USER_TYPES } from '../interfaces/types';
import { IGetUserApplication } from '../interfaces/applications/get.patient.application.interface';
import { IGetUserService } from '../interfaces/services/get.patient.service.interface';

@Injectable()
export class GetPatientApplication implements IGetUserApplication {
    constructor(@Inject(USER_TYPES.services.IGetUserService) private getUserService: IGetUserService) {}

    async getById(id: string): Promise<PatientDomain> {
        const user = await this.getUserService.getById(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} was not found`);
        }
        return user;
    }
}
