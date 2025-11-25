import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Repository } from "sequelize-typescript";
import AppointmentDomain from '@appointments/domain/appointment.domain';
import Appointment from '@appointments/domain/appointment.entity';
import IGetAllAppointmentService from '@appointments/interfaces/services/get.all.appointment.service.interface';

@Injectable()
export default class GetAllAppointmentService implements IGetAllAppointmentService {
    constructor(
        @InjectModel(Appointment) private appointmentRepository: Repository<Appointment>
    ){}

     getAll(): Promise<AppointmentDomain[]> {
        return this.appointmentRepository.findAll();
    }
}
