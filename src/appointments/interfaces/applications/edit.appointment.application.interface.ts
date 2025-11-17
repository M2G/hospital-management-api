import PartialAppointment from "@appointments/domain/partial.appointment.domain";
import AppointmentDomain from "@appointments/domain/appointment.domain";

export default interface IEditAppointmentApplication {
    update(id: string, data: PartialAppointment): Promise<AppointmentDomain>
}
