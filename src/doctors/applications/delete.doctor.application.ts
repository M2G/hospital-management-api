import { Inject, Injectable } from "@nestjs/common";
import IDeleteDoctorApplication from "@doctors/interfaces/applications/delete.doctor.application.interface";
import IDeleteDoctorService from "@doctors/interfaces/services/delete.doctor.service.interface";
import { DOCTOR_TYPES } from "@doctors/interfaces/types";

@Injectable()
export default class DeleteDoctorApplication implements IDeleteDoctorApplication {
    constructor(
        @Inject(DOCTOR_TYPES.services.IDeleteDoctorService) private doctorService: IDeleteDoctorService
    ){}

    remove(id: string): Promise<{deleted: boolean}> {
        return this.doctorService.remove(id)
    }
}
