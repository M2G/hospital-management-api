import DoctorDomain from '@doctors/domain/doctor.domain';

export default interface IGetAllDoctorService {
    getAll(): Promise<DoctorDomain[]>
}
