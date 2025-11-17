import { Controller, Inject, Post, Res, Body, HttpStatus, UsePipes, Get, Param, ParseUUIDPipe, Patch, Delete, ValidationPipe } from '@nestjs/common';
import AppointmentDomain from '@appointments/domain/appointment.domain';
import USER_TYPES from '@appointments/interfaces/types';
import ICreateAppointmentApplication from '@appointments/interfaces/applications/create.appointment.application.interface';
import IGetAppointmentApplication from '@appointments/interfaces/applications/get.appointment.application.interface';
import IGetAllAppointmentApplication from '@appointments/interfaces/applications/get.all.appointment.application.interface';
import IEditAppointmentApplication from '@appointments/interfaces/applications/edit.appointment.application.interface';
import IDeleteAppointmentApplication from '@appointments/interfaces/applications/delete.appointment.application.interface';
import PartialAppointment from '@appointments/domain/partial.appointment.domain';

@Controller('users')
export default class AppointmentController {
    constructor(
        @Inject(USER_TYPES.applications.ICreateAppointmentApplication) private createUserApp: ICreateAppointmentApplication,
        @Inject(USER_TYPES.applications.IGetAppointmentApplication) private getUserApp: IGetAppointmentApplication,
        @Inject(USER_TYPES.applications.IGetAllAppointmentApplication) private getAllUserApp: IGetAllAppointmentApplication,
        @Inject(USER_TYPES.applications.IEditAppointmentApplication) private editUserApp: IEditAppointmentApplication,
        @Inject(USER_TYPES.applications.IDeleteAppointmentApplication) private deleteUserApp: IDeleteAppointmentApplication
    ) {}

    @UsePipes(new ValidationPipe())
    @Post('/create')
    async create(@Res() res, @Body() userDomain: AppointmentDomain) {
        try {
            const user = await this.createUserApp.create(userDomain);
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
    async update(@Res() res, @Param('id', new ParseUUIDPipe()) id, @Body() data: PartialAppointment) {
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
