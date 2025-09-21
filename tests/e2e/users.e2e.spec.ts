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

describe('Users E2E Tests', () => {
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

  describe('Complete User Management Flow', () => {
    it('should complete full CRUD operations for users', async () => {
      // Step 1: Create a new user
      jest.spyOn(usersRepository, 'create').mockResolvedValue(mockUser);

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(mockCreateUserDto)
        .expect(201);

      expect(createResponse.body).toEqual(mockUser);
      expect(usersRepository.create).toHaveBeenCalledWith(mockCreateUserDto);

      // Step 2: Get all users
      jest.spyOn(usersRepository, 'find').mockResolvedValue(mockPaginationResult);

      const findAllResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({ filters: '', page: 1, pageSize: 10 })
        .expect(200);

      expect(findAllResponse.body).toEqual(mockPaginationResult);
      expect(usersRepository.find).toHaveBeenCalledWith({
        filters: '',
        page: 1,
        pageSize: 10,
      });

      // Step 3: Get user by ID
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);

      const findOneResponse = await request(app.getHttpServer())
        .get('/users/1')
        .set('Authorization', authToken)
        .expect(200);

      expect(findOneResponse.body).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith(1);

      // Step 4: Update user
      const updatedUser = { ...mockUser, ...mockUpdateUserDto };
      jest.spyOn(usersRepository, 'update').mockResolvedValue(updatedUser);

      const updateResponse = await request(app.getHttpServer())
        .put('/users/1')
        .set('Authorization', authToken)
        .send(mockUpdateUserDto)
        .expect(200);

      expect(updateResponse.body).toEqual(updatedUser);
      expect(usersRepository.update).toHaveBeenCalledWith(1, mockUpdateUserDto);

      // Step 5: Delete user
      jest.spyOn(usersRepository, 'remove').mockResolvedValue(true);

      const deleteResponse = await request(app.getHttpServer())
        .delete('/users/1')
        .set('Authorization', authToken)
        .expect(200);

      expect(deleteResponse.body).toBe(true);
      expect(usersRepository.remove).toHaveBeenCalledWith(1);
    });

    it('should handle user not found scenarios', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/users/999')
        .set('Authorization', authToken)
        .expect(404);
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const paginatedResult = {
        pageInfo: {
          count: 25,
          next: 2,
          pages: 3,
          prev: null,
        },
        results: Array.from({ length: 10 }, (_, i) => ({
          ...mockUser,
          id: i + 1,
          email: `user${i + 1}@example.com`,
        })),
      };
      jest.spyOn(usersRepository, 'find').mockResolvedValue(paginatedResult);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({ filters: '', page: 1, pageSize: 10 })
        .expect(200);

      // Assert
      expect(response.body).toEqual(paginatedResult);
      expect(response.body.pageInfo.count).toBe(25);
      expect(response.body.pageInfo.next).toBe(2);
      expect(response.body.pageInfo.pages).toBe(3);
      expect(response.body.results).toHaveLength(10);
    });
  });

  describe('Password Management Flow', () => {
    it('should complete forgot password and reset password flow', async () => {
      // Step 1: Forgot password
      jest.spyOn(usersRepository, 'forgotPassword').mockResolvedValue(true);

      const forgotPasswordDto: ForgotPasswordDTO = {
        email: 'test@example.com',
      };

      const forgotResponse = await request(app.getHttpServer())
        .post('/users/forgot-password')
        .set('Authorization', authToken)
        .send(forgotPasswordDto)
        .expect(200);

      expect(forgotResponse.body).toBe(true);
      expect(usersRepository.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);

      // Step 2: Reset password
      jest.spyOn(usersRepository, 'resetPassword').mockResolvedValue(true);

      const resetPasswordDto: ResetPasswordDTO = {
        token: 'valid-reset-token',
        password: 'newpassword123',
      };

      const resetResponse = await request(app.getHttpServer())
        .post('/users/reset-password')
        .set('Authorization', authToken)
        .send(resetPasswordDto)
        .expect(200);

      expect(resetResponse.body).toBe(true);
      expect(usersRepository.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });

    it('should handle change password flow', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'changePassword').mockResolvedValue(true);

      const changePasswordDto: ChangePasswordDTO = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      };

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

    it('should validate password strength during reset', async () => {
      // Arrange
      const weakPasswordDto: ResetPasswordDTO = {
        token: 'valid-token',
        password: '123', // too short
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users/reset-password')
        .set('Authorization', authToken)
        .send(weakPasswordDto)
        .expect(400);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all user endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/users' },
        { method: 'get', path: '/users/1' },
        { method: 'post', path: '/users' },
        { method: 'put', path: '/users/1' },
        { method: 'delete', path: '/users/1' },
        { method: 'post', path: '/users/forgot-password' },
        { method: 'post', path: '/users/reset-password' },
        { method: 'post', path: '/users/change-password' },
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          [endpoint.method](endpoint.path)
          .expect(401);
      }
    });

    it('should accept valid JWT tokens', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'find').mockResolvedValue(mockPaginationResult);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer valid-jwt-token')
        .query({ filters: '', page: 1, pageSize: 10 })
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockPaginationResult);
    });

    it('should reject malformed JWT tokens', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'InvalidToken')
        .expect(401);
    });
  });

  describe('Data Validation and Edge Cases', () => {
    it('should validate email format in user creation', async () => {
      // Arrange
      const invalidUserDto = {
        email: 'invalid-email-format',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(invalidUserDto)
        .expect(400);
    });

    it('should validate required fields in user creation', async () => {
      // Arrange
      const incompleteUserDto = {
        email: 'test@example.com',
        // missing password
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(incompleteUserDto)
        .expect(400);
    });

    it('should handle very long user data', async () => {
      // Arrange
      const longUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'A'.repeat(1000),
        last_name: 'B'.repeat(1000),
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(longUserDto)
        .expect(400);
    });

    it('should handle special characters in user data', async () => {
      // Arrange
      const specialCharUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'José María',
        last_name: 'O\'Connor-Smith',
      };

      jest.spyOn(usersRepository, 'create').mockResolvedValue({
        ...mockUser,
        first_name: 'José María',
        last_name: 'O\'Connor-Smith',
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(specialCharUserDto)
        .expect(201);

      // Assert
      expect(response.body.first_name).toBe('José María');
      expect(response.body.last_name).toBe('O\'Connor-Smith');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'find').mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({ filters: '', page: 1, pageSize: 10 })
        .expect(500);
    });

    it('should handle service layer errors', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'create').mockRejectedValue(new Error('Service unavailable'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(mockCreateUserDto)
        .expect(500);
    });

    it('should handle malformed JSON requests', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "password123"') // Missing closing brace
        .expect(400);
    });

    it('should handle missing request body', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .expect(400);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent user operations', async () => {
      // Arrange
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => ({
        email: `concurrent${i}@example.com`,
        password: 'password123',
      }));

      // Mock responses for all operations
      concurrentOperations.forEach((_, i) => {
        jest.spyOn(usersRepository, 'create').mockResolvedValueOnce({
          ...mockUser,
          id: i + 1,
          email: `concurrent${i}@example.com`,
        });
      });

      // Act
      const promises = concurrentOperations.map(user =>
        request(app.getHttpServer())
          .post('/users')
          .set('Authorization', authToken)
          .send(user)
      );

      const responses = await Promise.all(promises);

      // Assert
      responses.forEach((response, i) => {
        expect(response.status).toBe(201);
        expect(response.body.email).toBe(`concurrent${i}@example.com`);
      });
    });

    it('should handle large pagination requests', async () => {
      // Arrange
      const largeResult = {
        pageInfo: {
          count: 1000,
          next: 2,
          pages: 100,
          prev: null,
        },
        results: Array.from({ length: 50 }, (_, i) => ({
          ...mockUser,
          id: i + 1,
          email: `user${i + 1}@example.com`,
        })),
      };
      jest.spyOn(usersRepository, 'find').mockResolvedValue(largeResult);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({ filters: '', page: 1, pageSize: 50 })
        .expect(200);

      // Assert
      expect(response.body.pageInfo.count).toBe(1000);
      expect(response.body.results).toHaveLength(50);
    });
  });

  describe('Security Testing', () => {
    it('should not expose sensitive information in error responses', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'find').mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({ filters: '', page: 1, pageSize: 10 })
        .expect(500);

      // Assert
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('message');
      expect(response.body).not.toContain('Database');
    });

    it('should handle SQL injection attempts', async () => {
      // Arrange
      const maliciousQuery = {
        filters: "'; DROP TABLE users; --",
        page: 1,
        pageSize: 10,
      };

      // Act & Assert
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query(maliciousQuery)
        .expect(200); // Should be handled gracefully
    });

    it('should handle XSS attempts in user data', async () => {
      // Arrange
      const xssUserDto = {
        email: '<script>alert("xss")</script>@example.com',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(xssUserDto)
        .expect(400); // Should be caught by validation
    });
  });

  describe('API Contract Testing', () => {
    it('should maintain consistent response format for user creation', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'create').mockResolvedValue(mockUser);

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authToken)
        .send(mockCreateUserDto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('first_name');
      expect(response.body).toHaveProperty('last_name');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body).toHaveProperty('modified_at');
    });

    it('should maintain consistent response format for pagination', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'find').mockResolvedValue(mockPaginationResult);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authToken)
        .query({ filters: '', page: 1, pageSize: 10 })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('pageInfo');
      expect(response.body).toHaveProperty('results');
      expect(response.body.pageInfo).toHaveProperty('count');
      expect(response.body.pageInfo).toHaveProperty('next');
      expect(response.body.pageInfo).toHaveProperty('pages');
      expect(response.body.pageInfo).toHaveProperty('prev');
      expect(Array.isArray(response.body.results)).toBe(true);
    });
  });
});
