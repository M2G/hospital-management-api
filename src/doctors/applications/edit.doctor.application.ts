import { Inject, Injectable } from "@nestjs/common";
import PartialDoctor from "@doctors/domain/partial.doctor.domain";
import DoctorDomain from "@doctors/domain/doctor.domain";
import IEditUserApplication from "@doctors/interfaces/applications/edit.doctor.application.interface";
import IEditDoctorService from "@doctors/interfaces/services/edit.doctor.service.interface";
import { DOCTOR_TYPES } from "@doctors/interfaces/types";

@Injectable()
export default class EditDoctorApplication implements IEditUserApplication {

    constructor(
        @Inject(DOCTOR_TYPES.services.IEditDoctorService) private userService: IEditDoctorService
    ){}

    async update(id: string, data: PartialDoctor): Promise<DoctorDomain> {
        return await this.userService.update(id, data)
    }
}
