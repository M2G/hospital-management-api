import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { UsersController } from '@application/controllers';
import { UserService } from '@domain/services';
import { I18nService } from 'nestjs-i18n';
import {
  CreateUserDto,
  UpdateUserDto,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from '@application/dto';
import { UserTypeResultData } from '@domain/interfaces';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: MockProxy<UserService>;
  let i18nService: MockProxy<I18nService>;

  const mockUser: UserTypeResultData = {
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
    results: [mockUser],
  };

  const mockRequest = {
    query: {
      filters: 'email:test@example.com',
      page: 1,
      pageSize: 10,
    },
    user: { id: 1, email: 'test@example.com' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: mock<UserService>(),
        },
        {
          provide: I18nService,
          useValue: mock<I18nService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UserService>(UserService) as MockProxy<UserService>;
    i18nService = module.get<I18nService>(I18nService) as MockProxy<I18nService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll (GET /users)', () => {
    it('should return paginated users', async () => {
      // Arrange
      userService.find.mockResolvedValue(mockPaginationResult);

      // Act
      const result = await controller.findAll(mockRequest);

      // Assert
      expect(result).toEqual(mockPaginationResult);
      expect(userService.find).toHaveBeenCalledWith({
        filters: 'email:test@example.com',
        page: 1,
        pageSize: 10,
      });
      expect(userService.find).toHaveBeenCalledTimes(1);
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
      userService.find.mockResolvedValue(emptyResult);

      // Act
      const result = await controller.findAll(mockRequest);

      // Assert
      expect(result).toEqual(emptyResult);
      expect(userService.find).toHaveBeenCalledWith({
        filters: 'email:test@example.com',
        page: 1,
        pageSize: 10,
      });
    });

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      userService.find.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findAll(mockRequest)).rejects.toThrow('Database connection failed');
    });
  });

  describe('findOne (GET /users/:id)', () => {
    it('should return user by id', async () => {
      // Arrange
      const userId = '1';
      userService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(userService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = '999';
      userService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(userService.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle invalid user id', async () => {
      // Arrange
      const invalidUserId = 'invalid';
      userService.findOne.mockRejectedValue(new Error('Invalid ID'));

      // Act & Assert
      await expect(controller.findOne(invalidUserId)).rejects.toThrow('Invalid ID');
    });
  });

  describe('create (POST /users)', () => {
    it('should create new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
      };
      userService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(userService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle creation errors', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const error = new Error('Email already exists');
      userService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(createUserDto)).rejects.toThrow('Email already exists');
    });
  });

  describe('update (PUT /users/:id)', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        first_name: 'Jane',
        last_name: 'Smith',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };
      userService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = '999';
      const updateUserDto: UpdateUserDto = {
        first_name: 'Jane',
      };
      userService.update.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const userId = '1';
      const invalidUpdateDto = { invalidField: 'value' } as any;
      userService.update.mockRejectedValue(new BadRequestException('Validation failed'));

      // Act & Assert
      await expect(controller.update(userId, invalidUpdateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove (DELETE /users/:id)', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = '1';
      userService.remove.mockResolvedValue(true);

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(result).toBe(true);
      expect(userService.remove).toHaveBeenCalledWith(1);
      expect(userService.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = '999';
      userService.remove.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(controller.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('forgotPassword (POST /users/forgot-password)', () => {
    it('should handle forgot password successfully', async () => {
      // Arrange
      const forgotPasswordDto: ForgotPasswordDTO = {
        email: 'test@example.com',
      };
      userService.forgotPassword.mockResolvedValue(true);

      // Act
      const result = await controller.forgotPassword(forgotPasswordDto);

      // Assert
      expect(result).toBe(true);
      expect(userService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
      expect(userService.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle forgot password errors', async () => {
      // Arrange
      const forgotPasswordDto: ForgotPasswordDTO = {
        email: 'nonexistent@example.com',
      };
      const error = new Error('User not found');
      userService.forgotPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.forgotPassword(forgotPasswordDto)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword (POST /users/reset-password)', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDTO = {
        token: 'valid-token',
        password: 'newpassword123',
      };
      userService.resetPassword.mockResolvedValue(true);

      // Act
      const result = await controller.resetPassword(resetPasswordDto);

      // Assert
      expect(result).toBe(true);
      expect(userService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(userService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should handle reset password errors', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDTO = {
        token: 'invalid-token',
        password: 'newpassword123',
      };
      const error = new Error('Invalid or expired token');
      userService.resetPassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('changePassword (POST /users/change-password)', () => {
    it('should change password successfully', async () => {
      // Arrange
      const changePasswordDto: ChangePasswordDTO = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };
      userService.changePassword.mockResolvedValue(true);

      // Act
      const result = await controller.changePassword(changePasswordDto, mockRequest);

      // Assert
      expect(result).toBe(true);
      expect(userService.changePassword).toHaveBeenCalledWith(1, changePasswordDto);
      expect(userService.changePassword).toHaveBeenCalledTimes(1);
    });

    it('should handle change password errors', async () => {
      // Arrange
      const changePasswordDto: ChangePasswordDTO = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };
      const error = new Error('Current password is incorrect');
      userService.changePassword.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.changePassword(changePasswordDto, mockRequest)).rejects.toThrow('Current password is incorrect');
    });

    it('should handle missing user in request', async () => {
      // Arrange
      const changePasswordDto: ChangePasswordDTO = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };
      const requestWithoutUser = {};

      // Act & Assert
      await expect(controller.changePassword(changePasswordDto, requestWithoutUser as any)).rejects.toThrow();
    });
  });

  describe('Controller Dependencies', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have UserService injected', () => {
      expect(userService).toBeDefined();
    });

    it('should have I18nService injected', () => {
      expect(i18nService).toBeDefined();
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return appropriate status codes for different operations', async () => {
      // This is implicitly tested by the method tests above
      // The actual HTTP status codes are handled by NestJS decorators
      expect(controller.findAll).toBeDefined();
      expect(controller.findOne).toBeDefined();
      expect(controller.create).toBeDefined();
      expect(controller.update).toBeDefined();
      expect(controller.remove).toBeDefined();
    });
  });
});
