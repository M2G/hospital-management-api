import DoctorDomain from '@doctors/domain/doctor.domain';

export default interface IGetDoctorApplication {
    getById(id: string): Promise<DoctorDomain>;
}
