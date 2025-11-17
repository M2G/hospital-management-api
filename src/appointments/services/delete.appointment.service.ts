import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Appointment from '@appointments/domain/appointment.entity';

@Injectable()
export default class DeleteAppointmentService {

    constructor(
        @InjectModel(Appointment) private appointmentsRepository: typeof Appointment
    ){}

    async remove(id: string): Promise<any> {
      return this.appointmentsRepository.remove({userId: id})
    }
}
