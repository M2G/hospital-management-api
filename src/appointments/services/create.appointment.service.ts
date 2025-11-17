import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Appointment from '@appointments/domain/appointment.entity';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import ICreateAppointmentService from '@appointments/interfaces/services/create.appointment.service.interface';

@Injectable()
export default class CreateAppointmentService implements ICreateAppointmentService {
  constructor(@InjectModel(Appointment) private appointmentsRepository: typeof Appointment) {}

  create(user: AppointmentDomain): Promise<AppointmentDomain> {
    return this.appointmentsRepository.create(user);
  }
}
