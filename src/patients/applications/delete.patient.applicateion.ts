import { Inject, Injectable } from "@nestjs/common";
import IDeletePatientApplication from "@patients/interfaces/applications/delete.patient.application.interface";
import IDeletePatientService from "@patients/interfaces/services/delete.patient.service.interface";
import { PATIENT_TYPES } from "@patients/interfaces/types";

@Injectable()
export class DeleteUserApplication implements IDeletePatientApplication {
    constructor(
        @Inject(PATIENT_TYPES.services.IDeletePatientService) private userService: IDeletePatientService
    ){}

    async remove(id: string): Promise<{deleted: boolean}> {
        return await this.userService.remove(id)
    }
}
