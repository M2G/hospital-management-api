import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import DoctorDomain from '@doctors/domain/doctor.domain';
import { DOCTOR_TYPES } from '@doctors/interfaces/types';
import IGetDoctorApplication from '@doctors/interfaces/applications/get.doctor.application.interface';
import IGetDoctorService from '@doctors/interfaces/services/get.doctor.service.interface';

@Injectable()
export default class GetDoctorApplication implements IGetDoctorApplication {
  constructor(
    @Inject(DOCTOR_TYPES.services.IGetDoctorService) private getDoctorService: IGetDoctorService,
  ) {}

  async getById(id: string): Promise<DoctorDomain> {
    const user = await this.getDoctorService.getById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }
    return user;
  }
}
