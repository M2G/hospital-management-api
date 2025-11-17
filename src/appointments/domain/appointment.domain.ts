import { IsString, IsEmail } from 'class-validator';

export default class AppointmentDomain {
    @IsString()
    readonly fullName: string;

    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;
}
