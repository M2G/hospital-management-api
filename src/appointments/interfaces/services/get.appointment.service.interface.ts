import AppointmentDomain from '@appointments/domain/appointment.domain';

export default interface IGetAppointmentService {
    getById(id: string): Promise<AppointmentDomain>;
}
