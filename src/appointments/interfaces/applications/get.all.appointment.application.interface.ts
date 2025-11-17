import AppointmentDomain from '@appointments/domain/appointment.domain';

export default interface IGetAllUserApplication {
    getAll(): Promise<AppointmentDomain[]>
}
