import DoctorDomain from '@doctors/domain/doctor.domain';

export default interface ICreateDoctorService {
    create(userDomain: DoctorDomain): Promise<DoctorDomain>;
}
