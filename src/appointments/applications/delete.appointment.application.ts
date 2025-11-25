import { Inject, Injectable } from "@nestjs/common";
import IDeleteAppointmentApplication from "@appointments/interfaces/applications/delete.appointment.application.interface";
import IDeleteAppointmentService from "@appointments/interfaces/services/delete.appointment.service.interface";
import APPOINTMENT_TYPES from "@appointments/interfaces/types";

@Injectable()
export default class DeleteUserApplication implements IDeleteAppointmentApplication {
    constructor(
        @Inject(APPOINTMENT_TYPES.services.IDeleteAppointmentService) private userService: IDeleteAppointmentService
    ){}

     remove(id: string): Promise<{deleted: boolean}> {
        return this.userService.remove(id)
    }
}
