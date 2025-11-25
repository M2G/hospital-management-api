import { Inject, Injectable } from "@nestjs/common";
import { PartialUser } from "@patients/domain/partial.patient.domain";
import { PatientDomain } from "@patients/domain/patient.domain";
import { IEditUserApplication } from "@patients/interfaces/applications/edit.patient.application.interface";
import { IEditUserService } from "@patients/interfaces/services/edit.patient.service.interface";
import { USER_TYPES } from "@patients/interfaces/types";

@Injectable()
export class EditPatientApplication implements IEditUserApplication {

    constructor(
        @Inject(USER_TYPES.services.IEditUserService) private userService: IEditUserService
    ){}

    async update(id: string, data: PartialUser): Promise<PatientDomain> {
        return await this.userService.update(id, data)
    }
}
