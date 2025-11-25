import { Inject, Injectable } from "@nestjs/common";
import { PatientDomain } from "@patients/domain/patient.domain";
import { IGetAllUserApplication } from "@patients/interfaces/applications/get.all.patient.application.interface";
import { IGetAllUserService } from "@patients/interfaces/services/get.all.patient.service.interface";
import { USER_TYPES } from "@patients/interfaces/types";

@Injectable()
export class GetAllPatientApplication implements IGetAllUserApplication {
    constructor(
        @Inject(USER_TYPES.services.IGetAllUserService) private userService: IGetAllUserService,
    ) {}

    async getAll(): Promise<PatientDomain[]> {
        return await this.userService.getAll()
    }
}
