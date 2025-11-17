import { IsString, IsEmail } from 'class-validator';
import { DoctorDomain } from './doctor.domain';

export class PartialUser implements PartialUser {
    @IsString()
    readonly fullName: string;

    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;
}
