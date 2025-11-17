import { Inject, Injectable } from "@nestjs/common";
import { PatientDomain } from "../domain/patient.domain";
import { IGetAllUserApplication } from "../interfaces/applications/get.all.patient.application.interface";
import { IGetAllUserService } from "../interfaces/services/get.all.patient.service.interface";
import { USER_TYPES } from "../interfaces/types";

@Injectable()
export class GetAllPatientApplication implements IGetAllUserApplication {
    constructor(
        @Inject(USER_TYPES.services.IGetAllUserService) private userService: IGetAllUserService,
    ) {}

    async getAll(): Promise<PatientDomain[]> {
        return await this.userService.getAll()
    }
}
