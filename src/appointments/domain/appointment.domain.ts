import { IsString, IsNumber, IsDate } from 'class-validator';

export default class AppointmentDomain {
  @IsNumber()
  appointmentId: number;

  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsDate()
  appointmentDate: Date;

  @IsNumber()
  appointmentTime: number;

  @IsString()
  status: string;
}
