import DoctorDomain from '@doctors/domain/doctor.domain';

export default interface ICreateDoctorApplication {
    create(userDomain: DoctorDomain): Promise<DoctorDomain>;
}
