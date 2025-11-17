export default interface IDeleteAppointmentService {
    remove(id: string): Promise<{deleted: boolean}>
}
