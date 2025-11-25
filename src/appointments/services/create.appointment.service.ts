import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Repository } from "sequelize-typescript";
import Appointment from '@appointments/domain/appointment.entity';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import ICreateAppointmentService from '@appointments/interfaces/services/create.appointment.service.interface';

@Injectable()
export default class CreateAppointmentService implements ICreateAppointmentService {
  constructor(@InjectModel(Appointment) private appointmentsRepository: Repository<Appointment>) {}

  create(apppointment: AppointmentDomain): Promise<AppointmentDomain> {
    return this.appointmentsRepository.create(apppointment);
  }
}
