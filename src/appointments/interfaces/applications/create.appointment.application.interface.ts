import AppointmentDomain from '@appointments/domain/appointment.domain';

export default interface ICreateUserApplication {
    create(userDomain: AppointmentDomain): Promise<AppointmentDomain>;
}
