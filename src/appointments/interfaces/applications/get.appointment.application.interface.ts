import AppointmentDomain from '@appointments/domain/appointment.domain';

export default interface IGetAppointmentApplication {
    getById(id: string): Promise<AppointmentDomain>;
}
