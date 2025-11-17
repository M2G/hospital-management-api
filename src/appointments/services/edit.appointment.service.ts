import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import PartialAppointment from '@appointments/domain/partial.appointment.domain';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import Appointment from '@appointments/domain/appointment.entity';

@Injectable()
export default class EditAppointmentService {
    constructor(
        @InjectModel(Appointment) private appointmentsRepository: typeof Appointment,
    ){}

  update(id: string, data: PartialAppointment): Promise<AppointmentDomain> {
      return this.appointmentsRepository.update({userId: id}, data)
    }
}
