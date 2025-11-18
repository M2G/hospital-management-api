export default interface IDeleteDoctorService {
    remove(id: string): Promise<{deleted: boolean}>
}
