import { Injectable, Inject } from '@nestjs/common';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import ICreateAppointmentApplication from '@appointments/interfaces/applications/create.appointment.application.interface';
import { APPOINTMENT_TYPES } from '@appointments/interfaces/types';
import ICreateAppointmentService from '@appointments/interfaces/services/create.appointment.service.interface';

@Injectable()
export default class CreateAppointmentApplication implements ICreateAppointmentApplication {
    constructor(@Inject(APPOINTMENT_TYPES.services.ICreateAppointmentService) private userService: ICreateAppointmentService) {}

    async create(user: AppointmentDomain): Promise<AppointmentDomain> {
        return this.userService.create(user);
    }
}
