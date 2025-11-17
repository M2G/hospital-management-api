import { Inject, Injectable } from "@nestjs/common";
import { PartialUser } from "../domain/partial.patient.domain";
import { PatientDomain } from "../domain/patient.domain";
import { IEditUserApplication } from "../interfaces/applications/edit.patient.application.interface";
import { IEditUserService } from "../interfaces/services/edit.patient.service.interface";
import { USER_TYPES } from "../interfaces/types";

@Injectable()
export class EditPatientApplication implements IEditUserApplication {

    constructor(
        @Inject(USER_TYPES.services.IEditUserService) private userService: IEditUserService
    ){}

    async update(id: string, data: PartialUser): Promise<PatientDomain> {
        return await this.userService.update(id, data)
    }
}
