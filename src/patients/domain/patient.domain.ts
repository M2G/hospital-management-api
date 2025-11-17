import { IsString, IsEmail } from 'class-validator';

export class PatientDomain {
    @IsString()
    readonly fullName: string;

    @IsString()
    readonly password: string;

    @IsEmail()
    readonly email: string;
}
