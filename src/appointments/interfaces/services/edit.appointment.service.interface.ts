import PartialUser from "@appointments/domain/partial.appointment.domain";
import AppointmentDomain from "@appointments/domain/appointment.domain";

export default interface IEditAppointmentService {
    update(id: string, data: PartialUser): Promise<AppointmentDomain>
}
