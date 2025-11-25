import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'appointment', timestamps: false })
export default class Appointment extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  appointmentId: number;

  @Column
  patientId: string;

  @Column
  doctorId: string;

  @Column
  appointmentDate: Date;

  @Column
  appointmentTime: number;

  @Column
  status: string;
}
