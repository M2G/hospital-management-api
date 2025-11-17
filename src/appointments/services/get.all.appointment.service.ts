import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import Appointment from '@appointments/domain/appointment.entity';
import IGetAllAppointmentService from '@appointments/interfaces/services/get.all.appointment.service.interface';

@Injectable()
export default class GetAllAppointmentService implements IGetAllAppointmentService {
    constructor(
        @InjectModel(Appointment) private appointmentRepository: typeof Appointment
    ){}

     getAll(): Promise<AppointmentDomain[]> {
        return this.appointmentRepository.findAll();
    }
}
