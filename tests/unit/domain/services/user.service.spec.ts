import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UserService } from '@domain/services';
import { UsersRepository } from '@infrastructure/repository';
import { UserTypeResultData } from '@domain/interfaces';
import {
  CreateUserDto,
  UpdateUserDto,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
  AuthenticateDto,
} from '@application/dto';

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockProxy<UsersRepository>;

  const mockUserData: UserTypeResultData = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    created_at: new Date(),
    modified_at: new Date(),
    deleted_at: 0,
    last_connected_at: 0,
    reset_password_expires: '',
    reset_password_token: null,
  };

  const mockPaginationResult = {
    pageInfo: {
      count: 1,
      next: null,
      pages: 1,
      prev: null,
    },
    results: [mockUserData],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UsersRepository,
          useValue: mock<UsersRepository>(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get<UsersRepository>(UsersRepository) as MockProxy<UsersRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('should return paginated users with filters', async () => {
      // Arrange
      const filters = 'email:test@example.com';
      const page = 1;
      const pageSize = 10;
      usersRepository.find.mockResolvedValue(mockPaginationResult);

      // Act
      const result = await service.find({ filters, page, pageSize });

      // Assert
      expect(result).toEqual(mockPaginationResult);
      expect(usersRepository.find).toHaveBeenCalledWith({ filters, page, pageSize });
      expect(usersRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should handle empty results', async () => {
      // Arrange
      const emptyResult = {
        pageInfo: {
          count: 0,
          next: null,
          pages: 0,
          prev: null,
        },
        results: [],
      };
      usersRepository.find.mockResolvedValue(emptyResult);

      // Act
      const result = await service.find({ filters: '', page: 1, pageSize: 10 });

      // Assert
      expect(result).toEqual(emptyResult);
      expect(usersRepository.find).toHaveBeenCalledWith({ filters: '', page: 1, pageSize: 10 });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      usersRepository.find.mockRejectedValue(error);

      // Act & Assert
      await expect(service.find({ filters: '', page: 1, pageSize: 10 })).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      // Arrange
      const userId = 1;
      usersRepository.findOne.mockResolvedValue(mockUserData);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(mockUserData);
      expect(usersRepository.findOne).toHaveBeenCalledWith(userId);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 999;
      usersRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toBeNull();
      expect(usersRepository.findOne).toHaveBeenCalledWith(userId);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const userId = 1;
      const error = new Error('Database error');
      usersRepository.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
      };
      usersRepository.create.mockResolvedValue(mockUserData);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUserData);
      expect(usersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle creation errors', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error = new Error('Email already exists');
      usersRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow('Email already exists');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        first_name: 'Jane',
        last_name: 'Smith',
      };
      const updatedUser = { ...mockUserData, ...updateUserDto };
      usersRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(usersRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(usersRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle update errors', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        first_name: 'Jane',
      };
      const error = new Error('User not found');
      usersRepository.update.mockRejectedValue(error);

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow('User not found');
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 1;
      usersRepository.remove.mockResolvedValue(true);

      // Act
      const result = await service.remove(userId);

      // Assert
      expect(result).toBe(true);
      expect(usersRepository.remove).toHaveBeenCalledWith(userId);
      expect(usersRepository.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion errors', async () => {
      // Arrange
      const userId = 1;
      const error = new Error('User not found');
      usersRepository.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(service.remove(userId)).rejects.toThrow('User not found');
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password successfully', async () => {
      // Arrange
      const forgotPasswordDto: ForgotPasswordDTO = {
        email: 'test@example.com',
      };
      usersRepository.forgotPassword.mockResolvedValue(true);

      // Act
      const result = await service.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result).toBe(true);
      expect(usersRepository.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
      expect(usersRepository.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle forgot password errors', async () => {
      // Arrange
      const forgotPasswordDto: ForgotPasswordDTO = {
        email: 'nonexistent@example.com',
      };
      const error = new Error('User not found');
      usersRepository.forgotPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(service.forgotPassword(forgotPasswordDto)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDTO = {
        token: 'valid-token',
        password: 'newpassword123',
      };
      usersRepository.resetPassword.mockResolvedValue(true);

      // Act
      const result = await service.resetPassword(resetPasswordDto);

      // Assert
      expect(result).toBe(true);
      expect(usersRepository.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(usersRepository.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle reset password errors', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDTO = {
        token: 'invalid-token',
        password: 'newpassword123',
      };
      const error = new Error('Invalid or expired token');
      usersRepository.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const userId = 1;
      const changePasswordDto: ChangePasswordDTO = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };
      usersRepository.changePassword.mockResolvedValue(true);

      // Act
      const result = await service.changePassword(userId, changePasswordDto);

      // Assert
      expect(result).toBe(true);
      expect(usersRepository.changePassword).toHaveBeenCalledWith(userId, changePasswordDto);
      expect(usersRepository.changePassword).toHaveBeenCalledTimes(1);
    });

    it('should handle change password errors', async () => {
      // Arrange
      const userId = 1;
      const changePasswordDto: ChangePasswordDTO = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };
      const error = new Error('Current password is incorrect');
      usersRepository.changePassword.mockRejectedValue(error);

      // Act & Assert
      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow('Current password is incorrect');
    });
  });
});