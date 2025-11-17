import { Inject, Injectable } from "@nestjs/common";
import AppointmentDomain from "@appointments/domain/appointment.domain";
import IGetAllAppointmentApplication from "@appointments/interfaces/applications/get.all.appointment.application.interface";
import IGetAllAppointmentService from "@appointments/interfaces/services/get.all.appointment.service.interface";
import { APPOINTMENT_TYPES } from "@appointments/interfaces/types";

@Injectable()
export default class GetAllAppointmentApplication implements IGetAllAppointmentApplication {
    constructor(
        @Inject(APPOINTMENT_TYPES.services.IGetAllAppointmentService) private userService: IGetAllAppointmentService,
    ) {}

    async getAll(): Promise<AppointmentDomain[]> {
        return await this.userService.getAll()
    }
}
