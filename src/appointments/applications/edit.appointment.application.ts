import { Inject, Injectable } from "@nestjs/common";
import PartialAppointment from "@appointments/domain/partial.appointment.domain";
import AppointmentDomain from "@appointments/domain/appointment.domain";
import IEditAppointmentApplication from "@appointments/interfaces/applications/edit.appointment.application.interface";
import IEditAppointmentService from "@appointments/interfaces/services/edit.appointment.service.interface";
import APPOINTMENT_TYPES from "@appointments/interfaces/types";

@Injectable()
export default class EditAppointmentApplication implements IEditAppointmentApplication {

    constructor(
        @Inject(APPOINTMENT_TYPES.services.IEditAppointmentService) private userService: IEditAppointmentService
    ){}

    async update(id: string, data: PartialAppointment): Promise<AppointmentDomain> {
        return await this.userService.update(id, data)
    }
}

