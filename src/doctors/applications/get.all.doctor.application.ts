import { Inject, Injectable } from "@nestjs/common";
import DoctorDomain from "@doctors/domain/doctor.domain";
import IGetAllDoctorApplication from "@doctors/interfaces/applications/get.all.doctor.application.interface";
import IGetAllDoctorService from "@doctors/interfaces/services/get.all.doctor.service.interface";
import { DOCTOR_TYPES } from "@doctors/interfaces/types";

@Injectable()
export default class GetAllDoctorApplication implements IGetAllDoctorApplication {
    constructor(
        @Inject(DOCTOR_TYPES.services.IGetAllDoctorService) private userService: IGetAllDoctorService,
    ) {}

    async getAll(): Promise<DoctorDomain[]> {
        return await this.userService.getAll()
    }
}
