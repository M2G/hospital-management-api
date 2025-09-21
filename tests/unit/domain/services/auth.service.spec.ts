import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { AuthService } from '@domain/services';
import { AuthRepository } from '@infrastructure/repository';
import { CreateUserDto, LoginDto } from '@application/dto';
import { User } from '@infrastructure/models';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: MockProxy<AuthRepository>;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    first_name: 'John',
    last_name: 'Doe',
    created_at: new Date(),
    modified_at: new Date(),
    deleted_at: 0,
    last_connected_at: 0,
    reset_password_expires: '',
    reset_password_token: null,
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mock<AuthRepository>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository) as MockProxy<AuthRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when validation succeeds', async () => {
      // Arrange
      authRepository.validateUser.mockResolvedValue(mockUser as User);

      // Act
      const result = await service.validateUser(mockUser);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authRepository.validateUser).toHaveBeenCalledWith(mockUser);
      expect(authRepository.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should return null when validation fails', async () => {
      // Arrange
      authRepository.validateUser.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(mockUser);

      // Assert
      expect(result).toBeNull();
      expect(authRepository.validateUser).toHaveBeenCalledWith(mockUser);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      authRepository.validateUser.mockRejectedValue(error);

      // Act & Assert
      await expect(service.validateUser(mockUser)).rejects.toThrow('Database connection failed');
      expect(authRepository.validateUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('login', () => {
    it('should return access token for valid user', () => {
      // Arrange
      const loginUser = { id: 1, ...mockLoginDto };
      const expectedToken = { accessToken: 'jwt-token' };
      authRepository.login.mockReturnValue(expectedToken);

      // Act
      const result = service.login(loginUser);

      // Assert
      expect(result).toEqual(expectedToken);
      expect(authRepository.login).toHaveBeenCalledWith(loginUser);
      expect(authRepository.login).toHaveBeenCalledTimes(1);
    });

    it('should handle different user IDs', () => {
      // Arrange
      const loginUser1 = { id: 1, ...mockLoginDto };
      const loginUser2 = { id: 2, ...mockLoginDto };
      const expectedToken1 = { accessToken: 'jwt-token-1' };
      const expectedToken2 = { accessToken: 'jwt-token-2' };
      
      authRepository.login
        .mockReturnValueOnce(expectedToken1)
        .mockReturnValueOnce(expectedToken2);

      // Act
      const result1 = service.login(loginUser1);
      const result2 = service.login(loginUser2);

      // Assert
      expect(result1).toEqual(expectedToken1);
      expect(result2).toEqual(expectedToken2);
      expect(authRepository.login).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const expectedResult = { accessToken: 'jwt-token' };
      authRepository.register.mockResolvedValue(expectedResult);

      // Act
      const result = await service.register(mockCreateUserDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(authRepository.register).toHaveBeenCalledWith(mockCreateUserDto);
      expect(authRepository.register).toHaveBeenCalledTimes(1);
    });

    it('should handle registration errors', async () => {
      // Arrange
      const error = new Error('Email already exists');
      authRepository.register.mockRejectedValue(error);

      // Act & Assert
      await expect(service.register(mockCreateUserDto)).rejects.toThrow('Email already exists');
      expect(authRepository.register).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should handle different user data', async () => {
      // Arrange
      const user1 = { email: 'user1@example.com', password: 'pass1' };
      const user2 = { email: 'user2@example.com', password: 'pass2' };
      const token1 = { accessToken: 'token1' };
      const token2 = { accessToken: 'token2' };
      
      authRepository.register
        .mockResolvedValueOnce(token1)
        .mockResolvedValueOnce(token2);

      // Act
      const result1 = await service.register(user1);
      const result2 = await service.register(user2);

      // Assert
      expect(result1).toEqual(token1);
      expect(result2).toEqual(token2);
      expect(authRepository.register).toHaveBeenCalledTimes(2);
    });
  });
});