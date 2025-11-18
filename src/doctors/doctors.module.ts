import { Module } from '@nestjs/common';
import DoctorsController from './controller/doctor.controller';
import { CreateDoctorService } from './services/create.doctor.service';
import Doctor from './domain/doctor.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreateDoctorApplication } from './applications/create.doctor.application';
import { DOCTOR_TYPES } from './interfaces/types';
import GetDoctorApplication from './applications/get.doctor.application';
import GetDoctorService from './services/get.doctor.service';
import GetAllDoctorService from './services/get.all.doctor.service';
import GetAllDoctorApplication from './applications/get.all.doctor.application';
import EditDoctorService from './services/edit.doctor.service';
import DeleteDoctorService from './services/delete.doctor.service';
import EditDoctorApplication from './applications/edit.doctor.application';
import DeleteDoctorApplication from './applications/delete.doctor.application';

const createUserApp = { provide: DOCTOR_TYPES.applications.ICreateDoctorApplication, useClass: CreateDoctorApplication };
const getUserApp = { provide: DOCTOR_TYPES.applications.IGetDoctorApplication, useClass: GetDoctorApplication };
const getAllUserApp = { provide: DOCTOR_TYPES.applications.IGetAllDoctorApplication, useClass: GetAllDoctorApplication}
const editUserApp = { provide: DOCTOR_TYPES.applications.IEditDoctorApplication, useClass: EditDoctorApplication}
const deleteUserApp = { provide: DOCTOR_TYPES.applications.IDeleteDoctorApplication, useClass: DeleteDoctorApplication}

const createUserService = { provide: DOCTOR_TYPES.services.ICreateDoctorService, useClass: CreateDoctorService };
const getUserService = { provide: DOCTOR_TYPES.services.IGetDoctorService, useClass: GetDoctorService };
const getAllUserService = { provide: DOCTOR_TYPES.services.IGetAllDoctorService, useClass: GetAllDoctorService };
const editUserService = { provide: DOCTOR_TYPES.services.IEditDoctorService, useClass: EditDoctorService}
const deleteUserService = { provide: DOCTOR_TYPES.services.IDeleteDoctorService, useClass: DeleteDoctorService}

@Module({
  imports: [SequelizeModule.forFeature([Doctor])],
  controllers: [DoctorsController],
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
export class UsersModule {}
