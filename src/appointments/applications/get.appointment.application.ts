import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import APPOINTMENT_TYPES from '@appointments/interfaces/types';
import IGetAppointmentApplication from '@appointments/interfaces/applications/get.appointment.application.interface';
import IGetAppointmentService from '@appointments/interfaces/services/get.appointment.service.interface';

@Injectable()
export default class GetAppointmentApplication implements IGetAppointmentApplication {
    constructor(@Inject(APPOINTMENT_TYPES.services.IGetAppointmentService) private getUserService: IGetAppointmentService) {}

    async getById(id: string): Promise<AppointmentDomain> {
        const user = await this.getUserService.getById(id);
        if (!user) {
            throw new NotFoundException(`User with id ${id} was not found`);
        }
        return user;
    }
}
