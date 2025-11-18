import DoctorDomain from '@doctors/domain/doctor.domain';

export default interface IGetDoctorService {
    getById(id: string): Promise<DoctorDomain>;
}
