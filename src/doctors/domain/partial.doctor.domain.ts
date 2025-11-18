import { IsString, IsEmail } from 'class-validator';
import DoctorDomain from './doctor.domain';

export default class PartialDoctor implements DoctorDomain {
    @IsString()
    readonly fullName: string;

    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;
}
