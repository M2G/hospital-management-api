import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'doctors', timestamps: false })
export default class Doctor extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: number;

  @Column
  email: string;

  @Column
  first_name: string;

  @Column
  last_name: string;

  @Column
  password: string;

  @Column
  created_at: Date;

  @Column
  deleted_at: number;

  @Column
  modified_at: Date;
}
