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
import AuthModule from '../../src/auth.module';
import { AuthService } from '@domain/services';
import { AuthRepository } from '@infrastructure/repository';
import { User } from '@infrastructure/models';
import { getModelToken } from '@nestjs/sequelize';
import { CreateUserDto, LoginDto } from '@application/dto';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let authRepository: AuthRepository;
  let userModel: typeof User;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    first_name: 'John',
    last_name: 'Doe',
    created_at: new Date(),
    modified_at: new Date(),
    deleted_at: 0,
    last_connected_at: 0,
    reset_password_expires: '',
    reset_password_token: null,
    validatePassword: jest.fn().mockResolvedValue(true),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'newuser@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
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
        AuthModule,
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

    authService = moduleFixture.get<AuthService>(AuthService);
    authRepository = moduleFixture.get<AuthRepository>(AuthRepository);
    userModel = moduleFixture.get<typeof User>(getModelToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete User Registration Flow', () => {
    it('should register a new user and return access token', async () => {
      // Arrange
      const mockCreatedUser = { ...mockUser, email: 'newuser@example.com' };
      const mockToken = { accessToken: 'jwt-token-123' };
      
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      jest.spyOn(authRepository, 'register').mockResolvedValue(mockToken);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(mockCreateUserDto)
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockToken);
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken).toBeTruthy();
    });

    it('should handle registration with existing email', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'register').mockRejectedValue(new Error('Email already exists'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(mockCreateUserDto)
        .expect(500);
    });

    it('should validate email format during registration', async () => {
      // Arrange
      const invalidUserDto = {
        email: 'invalid-email-format',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserDto)
        .expect(400);
    });

    it('should validate password strength during registration', async () => {
      // Arrange
      const weakPasswordDto = {
        email: 'test@example.com',
        password: '123', // too short
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordDto)
        .expect(400);
    });
  });

  describe('Complete User Authentication Flow', () => {
    it('should authenticate user and return access token', async () => {
      // Arrange
      const mockToken = { accessToken: 'jwt-token-123' };
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'validateUser').mockResolvedValue(mockUser as any);
      jest.spyOn(authRepository, 'login').mockReturnValue(mockToken);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(mockLoginDto)
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockToken);
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken).toBeTruthy();
    });

    it('should reject authentication with invalid credentials', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      jest.spyOn(authRepository, 'validateUser').mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(mockLoginDto)
        .expect(401);
    });

    it('should reject authentication with wrong password', async () => {
      // Arrange
      const userWithWrongPassword = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(false),
      };
      (userModel.findOne as jest.Mock).mockResolvedValue(userWithWrongPassword);
      jest.spyOn(authRepository, 'validateUser').mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(mockLoginDto)
        .expect(401);
    });

    it('should validate email format during authentication', async () => {
      // Arrange
      const invalidLoginDto = {
        email: 'invalid-email-format',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(invalidLoginDto)
        .expect(400);
    });
  });

  describe('Complete User Journey', () => {
    it('should complete full user registration and authentication flow', async () => {
      // Step 1: Register a new user
      const mockCreatedUser = { ...mockUser, email: 'journey@example.com' };
      const mockRegisterToken = { accessToken: 'register-token-123' };
      
      (userModel.findOne as jest.Mock).mockResolvedValueOnce(null); // No existing user
      (userModel.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      jest.spyOn(authRepository, 'register').mockResolvedValue(mockRegisterToken);

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'journey@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');

      // Step 2: Authenticate the same user
      const mockAuthToken = { accessToken: 'auth-token-123' };
      (userModel.findOne as jest.Mock).mockResolvedValueOnce(mockCreatedUser);
      jest.spyOn(authRepository, 'validateUser').mockResolvedValue(mockCreatedUser as any);
      jest.spyOn(authRepository, 'login').mockReturnValue(mockAuthToken);

      const authResponse = await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send({
          email: 'journey@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(authResponse.body).toHaveProperty('accessToken');
    });

    it('should handle multiple user registrations', async () => {
      const users = [
        { email: 'user1@example.com', password: 'password123' },
        { email: 'user2@example.com', password: 'password456' },
        { email: 'user3@example.com', password: 'password789' },
      ];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const mockCreatedUser = { ...mockUser, id: i + 1, email: user.email };
        const mockToken = { accessToken: `token-${i + 1}` };
        
        (userModel.findOne as jest.Mock).mockResolvedValueOnce(null);
        (userModel.create as jest.Mock).mockResolvedValueOnce(mockCreatedUser);
        jest.spyOn(authRepository, 'register').mockResolvedValueOnce(mockToken);

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user)
          .expect(201);

        expect(response.body).toHaveProperty('accessToken');
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password": "password123"') // Missing closing brace
        .expect(400);
    });

    it('should handle missing request body', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .expect(400);
    });

    it('should handle extra fields in request body', async () => {
      // Arrange
      const userWithExtraFields = {
        email: 'test@example.com',
        password: 'password123',
        extraField: 'should be ignored',
        anotherField: 123,
      };

      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'register').mockResolvedValue({ accessToken: 'token' });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userWithExtraFields)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should handle very long email addresses', async () => {
      // Arrange
      const longEmail = 'a'.repeat(300) + '@example.com';
      const userWithLongEmail = {
        email: longEmail,
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userWithLongEmail)
        .expect(400);
    });

    it('should handle very long passwords', async () => {
      // Arrange
      const longPassword = 'a'.repeat(1000);
      const userWithLongPassword = {
        email: 'test@example.com',
        password: longPassword,
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userWithLongPassword)
        .expect(400);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent registration requests', async () => {
      // Arrange
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => ({
        email: `concurrent${i}@example.com`,
        password: 'password123',
      }));

      // Mock responses for all requests
      concurrentRequests.forEach((_, i) => {
        (userModel.findOne as jest.Mock).mockResolvedValueOnce(null);
        (userModel.create as jest.Mock).mockResolvedValueOnce({ ...mockUser, id: i + 1 });
        jest.spyOn(authRepository, 'register').mockResolvedValueOnce({ accessToken: `token-${i}` });
      });

      // Act
      const promises = concurrentRequests.map(user =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send(user)
      );

      const responses = await Promise.all(promises);

      // Assert
      responses.forEach((response, i) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('accessToken');
      });
    });

    it('should handle rapid authentication requests', async () => {
      // Arrange
      const rapidRequests = Array.from({ length: 5 }, () => mockLoginDto);

      // Mock responses for all requests
      rapidRequests.forEach(() => {
        (userModel.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
        jest.spyOn(authRepository, 'validateUser').mockResolvedValueOnce(mockUser as any);
        jest.spyOn(authRepository, 'login').mockReturnValueOnce({ accessToken: 'token' });
      });

      // Act
      const promises = rapidRequests.map(loginDto =>
        request(app.getHttpServer())
          .post('/auth/authenticate')
          .send(loginDto)
      );

      const responses = await Promise.all(promises);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('accessToken');
      });
    });
  });

  describe('Security Testing', () => {
    it('should not expose sensitive information in error responses', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(mockCreateUserDto)
        .expect(500);

      // Assert
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('message');
      expect(response.body).not.toContain('Database');
    });

    it('should handle SQL injection attempts', async () => {
      // Arrange
      const maliciousUser = {
        email: "'; DROP TABLE users; --",
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(maliciousUser)
        .expect(400); // Should be caught by validation
    });

    it('should handle XSS attempts', async () => {
      // Arrange
      const xssUser = {
        email: '<script>alert("xss")</script>@example.com',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(xssUser)
        .expect(400); // Should be caught by validation
    });
  });

  describe('API Contract Testing', () => {
    it('should maintain consistent response format for registration', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'register').mockResolvedValue({ accessToken: 'token' });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(mockCreateUserDto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(Object.keys(response.body)).toEqual(['accessToken']);
    });

    it('should maintain consistent response format for authentication', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'validateUser').mockResolvedValue(mockUser as any);
      jest.spyOn(authRepository, 'login').mockReturnValue({ accessToken: 'token' });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(mockLoginDto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(Object.keys(response.body)).toEqual(['accessToken']);
    });
  });
});
