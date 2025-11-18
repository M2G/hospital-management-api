export default interface IDeleteDoctorApplication {
    remove(id: string): Promise<{deleted: boolean}>
}
