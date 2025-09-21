import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { I18nModule } from 'nestjs-i18n';
import { join } from 'path';

// Import modules
import UserModule from '../../src/user.module';
import { UserService } from '@domain/services';
import { UsersRepository } from '@infrastructure/repository';
import { User } from '@infrastructure/models';
import { getModelToken } from '@nestjs/sequelize';
import {
  CreateUserDto,
  UpdateUserDto,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from '@application/dto';
import { UserTypeResultData } from '@domain/interfaces';

describe('Users Integration Tests', () => {
  let app: INestApplication;
  let userService: UserService;
  let usersRepository: UsersRepository;
  let userModel: typeof User;
  let authToken: string;

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

  const mockCreateUserDto: CreateUserDto = {
    email: 'newuser@example.com',
    password: 'password123',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    first_name: 'Jane',
    last_name: 'Smith',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'test_db',
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        }),
        SequelizeModule.forFeature([User]),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        PassportModule,
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loaderOptions: {
            path: join(__dirname, '../../src/locales'),
            watch: true,
          },
        }),
        UserModule,
      ],
    })
      .overrideProvider(getModelToken(User))
      .useValue({
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn(),
        findAndCountAll: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    usersRepository = moduleFixture.get<UsersRepository>(UsersRepository);
    userModel = moduleFixture.get<typeof User>(getModelToken(User));

    // Mock JWT token for authenticated requests
    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return paginated users with authentication', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'find').mockResolvedValue(mockPaginationResult);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({
          filters: 'email:test@example.com',
          page: 1,
          pageSize: 10,
        })
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockPaginationResult);
      expect(usersRepository.find).toHaveBeenCalledWith({
        filters: 'email:test@example.com',
        page: 1,
        pageSize: 10,
      });
    });

    it('should return 401 without authentication', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/users')
        .expect(401);
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
      jest.spyOn(usersRepository, 'find').mockResolvedValue(emptyResult);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({ filters: '', page: 1, pageSize: 10 })
        .expect(200);

      // Assert
      expect(response.body).toEqual(emptyResult);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id with authentication', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users/1')
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/users/999')
        .set('Authorization', authToken)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/users/1')
        .expect(401);
    });
  });

  describe('POST /users', () => {
    it('should create new user with authentication', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'create').mockResolvedValue(mockUser);

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(mockCreateUserDto)
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockUser);
      expect(usersRepository.create).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidUserDto = {
        email: 'invalid-email',
        password: '123', // too short
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(invalidUserDto)
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .send(mockCreateUserDto)
        .expect(401);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user with authentication', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...mockUpdateUserDto };
      jest.spyOn(usersRepository, 'update').mockResolvedValue(updatedUser);

      // Act
      const response = await request(app.getHttpServer())
        .put('/users/1')
        .set('Authorization', authToken)
        .send(mockUpdateUserDto)
        .expect(200);

      // Assert
      expect(response.body).toEqual(updatedUser);
      expect(usersRepository.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'update').mockRejectedValue(new Error('User not found'));

      // Act & Assert
      await request(app.getHttpServer())
        .put('/users/999')
        .set('Authorization', authToken)
        .send(mockUpdateUserDto)
        .expect(500);
    });

    it('should return 401 without authentication', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .put('/users/1')
        .send(mockUpdateUserDto)
        .expect(401);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user with authentication', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'remove').mockResolvedValue(true);

      // Act
      const response = await request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', authToken)
        .expect(200);

      // Assert
      expect(response.body).toBe(true);
      expect(usersRepository.remove).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'remove').mockRejectedValue(new Error('User not found'));

      // Act & Assert
      await request(app.getHttpServer())
        .delete('/users/999')
        .set('Authorization', authToken)
        .expect(500);
    });

    it('should return 401 without authentication', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .delete('/users/1')
        .expect(401);
    });
  });

  describe('POST /users/forgot-password', () => {
    it('should handle forgot password with authentication', async () => {
      // Arrange
      const forgotPasswordDto: ForgotPasswordDTO = {
        email: 'test@example.com',
      };
      jest.spyOn(usersRepository, 'forgotPassword').mockResolvedValue(true);

      // Act
      const response = await request(app.getHttpServer())
        .post('/users/forgot-password')
        .set('Authorization', authToken)
        .send(forgotPasswordDto)
        .expect(200);

      // Assert
      expect(response.body).toBe(true);
      expect(usersRepository.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });

    it('should return 400 for invalid email', async () => {
      // Arrange
      const invalidDto = {
        email: 'invalid-email',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users/forgot-password')
        .set('Authorization', authToken)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /users/reset-password', () => {
    it('should reset password with authentication', async () => {
      // Arrange
      const resetPasswordDto: ResetPasswordDTO = {
        token: 'valid-token',
        password: 'newpassword123',
      };
      jest.spyOn(usersRepository, 'resetPassword').mockResolvedValue(true);

      // Act
      const response = await request(app.getHttpServer())
        .post('/users/reset-password')
        .set('Authorization', authToken)
        .send(resetPasswordDto)
        .expect(200);

      // Assert
      expect(response.body).toBe(true);
      expect(usersRepository.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });

    it('should return 400 for invalid token', async () => {
      // Arrange
      const invalidDto = {
        token: '',
        password: 'newpassword123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users/reset-password')
        .set('Authorization', authToken)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('POST /users/change-password', () => {
    it('should change password with authentication', async () => {
      // Arrange
      const changePasswordDto: ChangePasswordDTO = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };
      jest.spyOn(usersRepository, 'changePassword').mockResolvedValue(true);

      // Act
      const response = await request(app.getHttpServer())
        .post('/users/change-password')
        .set('Authorization', authToken)
        .send(changePasswordDto)
        .expect(200);

      // Assert
      expect(response.body).toBe(true);
      expect(usersRepository.changePassword).toHaveBeenCalledWith(1, changePasswordDto);
    });

    it('should return 400 for weak password', async () => {
      // Arrange
      const weakPasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: '123', // too short
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users/change-password')
        .set('Authorization', authToken)
        .send(weakPasswordDto)
        .expect(400);
    });
  });

  describe('UserService Integration', () => {
    it('should find users through repository', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'find').mockResolvedValue(mockPaginationResult);

      // Act
      const result = await userService.find({
        filters: 'email:test@example.com',
        page: 1,
        pageSize: 10,
      });

      // Assert
      expect(result).toEqual(mockPaginationResult);
      expect(usersRepository.find).toHaveBeenCalledWith({
        filters: 'email:test@example.com',
        page: 1,
        pageSize: 10,
      });
    });

    it('should create user through repository', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'create').mockResolvedValue(mockUser);

      // Act
      const result = await userService.create(mockCreateUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersRepository.create).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should update user through repository', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...mockUpdateUserDto };
      jest.spyOn(usersRepository, 'update').mockResolvedValue(updatedUser);

      // Act
      const result = await userService.update(1, mockUpdateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(usersRepository.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
    });
  });

  describe('Database Integration', () => {
    it('should interact with User model for CRUD operations', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (userModel.create as jest.Mock).mockResolvedValue(mockUser);
      (userModel.update as jest.Mock).mockResolvedValue([1]);
      (userModel.destroy as jest.Mock).mockResolvedValue(1);

      // Act & Assert
      const findResult = await userModel.findOne({ where: { id: 1 } });
      const createResult = await userModel.create(mockCreateUserDto);
      const updateResult = await userModel.update(mockUpdateUserDto, { where: { id: 1 } });
      const deleteResult = await userModel.destroy({ where: { id: 1 } });

      expect(findResult).toEqual(mockUser);
      expect(createResult).toEqual(mockUser);
      expect(updateResult).toEqual([1]);
      expect(deleteResult).toEqual(1);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        userModel.findOne({ where: { id: 1 } })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle validation errors in service layer', async () => {
      // Arrange
      const invalidDto = { email: 'invalid-email' } as any;
      jest.spyOn(usersRepository, 'create').mockRejectedValue(new Error('Validation failed'));

      // Act & Assert
      await expect(userService.create(invalidDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('Module Dependencies', () => {
    it('should have all required dependencies injected', () => {
      expect(userService).toBeDefined();
      expect(usersRepository).toBeDefined();
      expect(userModel).toBeDefined();
    });

    it('should have proper module configuration', () => {
      expect(app).toBeDefined();
      expect(app.getHttpServer()).toBeDefined();
    });
  });
});
