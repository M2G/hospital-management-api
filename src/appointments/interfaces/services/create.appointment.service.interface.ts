import AppointmentDomain from '@appointments/domain/appointment.domain';

export default interface ICreateAppointmentService {
    create(userDomain: AppointmentDomain): Promise<AppointmentDomain>;
}
