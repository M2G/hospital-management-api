import { Controller, Inject, Post, Res, Body, HttpStatus, UsePipes, Get, Param, ParseUUIDPipe, Patch, Delete, ValidationPipe } from '@nestjs/common';
import DoctorDomain from '@doctors/domain/doctor.domain';
import { DOCTOR_TYPES } from '@doctors/interfaces/types';
import  ICreateDoctorApplication  from '@doctors/interfaces/applications/create.doctor.application.interface';
import  IGetDoctorApplication  from '@doctors/interfaces/applications/get.doctor.application.interface';
import  IGetAllDoctorApplication  from '@doctors/interfaces/applications/get.all.doctor.application.interface';
import  IEditDoctorApplication  from '@doctors/interfaces/applications/edit.doctor.application.interface';
import  IDeleteDoctorApplication  from '@doctors/interfaces/applications/delete.doctor.application.interface';
import  PartialUser  from '@doctors/domain/partial.doctor.domain';

@Controller('users')
export default class DoctorController {
    constructor(
        @Inject(DOCTOR_TYPES.applications.ICreateDoctorApplication) private createUserApp: ICreateDoctorApplication,
        @Inject(DOCTOR_TYPES.applications.IGetDoctorApplication) private getUserApp: IGetDoctorApplication,
        @Inject(DOCTOR_TYPES.applications.IGetAllDoctorApplication) private getAllUserApp: IGetAllDoctorApplication,
        @Inject(DOCTOR_TYPES.applications.IEditDoctorApplication) private editUserApp: IEditDoctorApplication,
        @Inject(DOCTOR_TYPES.applications.IDeleteDoctorApplication) private deleteUserApp: IDeleteDoctorApplication
    ) {}

    @UsePipes(new ValidationPipe())
    @Post('/create')
    async create(@Res() res, @Body() doctorDomain: DoctorDomain) {
        try {
            const user = await this.createUserApp.create(doctorDomain);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.CREATED,
                message: `${user.fullName} successfully created`
            });
        } catch (err) {
            return res.status(HttpStatus.BAD_REQUEST).json(err)
        }
    }

    @Get(':id')
    async findOne(@Res() res, @Param('id', new ParseUUIDPipe()) id) {
        try {
            const user = await this.getUserApp.getById(id);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: user
            });
        } catch (err) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err
            })
        }

    }

    @Get()
    async findAll(@Res() res) {
        try {
            const users = await this.getAllUserApp.getAll();
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: users
            });
        } catch (err) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err
            })
        }
    }

    @Patch('/update/:id')
    async update(@Res() res, @Param('id', new ParseUUIDPipe()) id, @Body() data: PartialUser) {
        try {
            const updatedUser = await this.editUserApp.update(id, data);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: updatedUser
            });
        } catch (err) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err
            })
        }
    }

    @Delete('/delete/:id')
    async remove(@Res() res, @Param('id', new ParseUUIDPipe()) id: string) {
        try {
            await this.deleteUserApp.remove(id)
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: "User successfully deleted"
            })
        } catch (err) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err
            })
        }
    }
}
