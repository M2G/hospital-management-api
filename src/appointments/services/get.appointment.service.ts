import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Appointment from '@appointments/domain/appointment.entity';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import IGetAppointmentService from '@appointments/interfaces/services/get.appointment.service.interface';

@Injectable()
export default class GetAppointmentService implements IGetAppointmentService {
    constructor(@InjectModel(Appointment) appointmentsRepository: typeof Appointment) {}

    async getById(id: string): Promise<AppointmentDomain> {
        return this.appointmentsRepository.findOne({ userId: id });
    }
}
