import PartialDoctor from "@doctors/domain/partial.doctor.domain";
import DoctorDomain from '@doctors/domain/doctor.domain';

export default interface IEditUserService {
    update(id: string, data: PartialDoctor): Promise<DoctorDomain>
}
