import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto, LoginDto } from '@application/dto';
import { AuthRepository } from '@infrastructure/repository';
import { User } from '@infrastructure/models';

@Injectable()
class AuthService {
  constructor(
    @Inject(forwardRef(() => AuthRepository)) private readonly authRepository: AuthRepository,
  ) {}

  validateUser(user): Promise<User | null> {
    return this.authRepository.validateUser(user);
  }

  login(loginUser: { id: number } & LoginDto): { accessToken: string } {
    return this.authRepository.login(loginUser);
  }

  register(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    return this.authRepository.register(createUserDto);
  }
}

export default AuthService;
