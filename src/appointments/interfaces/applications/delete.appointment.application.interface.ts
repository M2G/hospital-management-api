export default interface IDeleteAppointmentApplication {
    remove(id: string): Promise<{deleted: boolean}>
}
