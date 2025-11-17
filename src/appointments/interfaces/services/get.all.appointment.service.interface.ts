import AppointmentDomain from "@appointments/domain/appointment.domain";

export default interface IGetAllAppointmentService {
    getAll(): Promise<AppointmentDomain[]>
}
