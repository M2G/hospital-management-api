import { IsString, IsEmail } from 'class-validator';
import AppointmentDomain from './appointment.domain';

export default class PartialUser implements AppointmentDomain {
    @IsString()
    readonly fullName: string;

    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;
}
