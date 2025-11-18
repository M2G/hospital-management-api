import DoctorDomain from '@doctors/domain/doctor.domain';

export default interface IGetAllDoctorApplication {
    getAll(): Promise<DoctorDomain[]>
}
