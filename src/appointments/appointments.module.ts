import { Module } from '@nestjs/common';
import AppointmentController from './controller/appointment.controller';
import CreateAppointmentService from './services/create.appointment.service';
import Appointment from './domain/appointment.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import CreateAppointmentApplication from './applications/create.appointment.application';
import APPOINTMENT_TYPES from './interfaces/types';
import GetAppointmentApplication from './applications/get.appointment.application';
import GetAppointmentService from './services/get.appointment.service';
import GetAllAppointmentService from './services/get.all.appointment.service';
import GetAllAppointmentApplication from './applications/get.all.appointment.application';
import EditAppointmentService from './services/edit.appointment.service';
import DeleteAppointmentService from './services/delete.appointment.service';
import EditAppointmentApplication from './applications/edit.appointment.application';
import DeleteAppointmentApplication from './applications/delete.appointment.application';

const createUserApp = { provide: APPOINTMENT_TYPES.applications.ICreateAppointmentApplication, useClass: CreateAppointmentApplication };
const getUserApp = { provide: APPOINTMENT_TYPES.applications.IGetAppointmentApplication, useClass: GetAppointmentApplication };
const getAllUserApp = { provide: APPOINTMENT_TYPES.applications.IGetAllAppointmentApplication, useClass: GetAllAppointmentApplication}
const editUserApp = { provide: APPOINTMENT_TYPES.applications.IEditAppointmentApplication, useClass: EditAppointmentApplication}
const deleteUserApp = { provide: APPOINTMENT_TYPES.applications.IDeleteAppointmentApplication, useClass: DeleteAppointmentApplication}

const createUserService = { provide: APPOINTMENT_TYPES.services.ICreateAppointmentService, useClass: CreateAppointmentService };
const getUserService = { provide: APPOINTMENT_TYPES.services.IGetAppointmentService, useClass: GetAppointmentService };
const getAllUserService = { provide: APPOINTMENT_TYPES.services.IGetAllAppointmentService, useClass: GetAllAppointmentService };
const editUserService = { provide: APPOINTMENT_TYPES.services.IEditAppointmentService, useClass: EditAppointmentService}
const deleteUserService = { provide: APPOINTMENT_TYPES.services.IDeleteAppointmentService, useClass: DeleteAppointmentService}

@Module({
  imports: [SequelizeModule.forFeature([Appointment])],
  controllers: [AppointmentController],
  providers: [
    createUserApp,
    getUserApp,
    getAllUserApp,
    editUserApp,
    deleteUserApp,
    createUserService,
    getUserService,
    getAllUserService,
    editUserService,
    deleteUserService
  ],
})
export default class AppointmentModule {}
