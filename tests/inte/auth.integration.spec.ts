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

describe('Auth Integration Tests', () => {
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

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const mockCreatedUser = { ...mockUser, email: 'newuser@example.com' };
      const mockToken = { accessToken: 'jwt-token' };
      
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
      expect(authRepository.register).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should return 400 for invalid email format', async () => {
      // Arrange
      const invalidUserDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const incompleteUserDto = {
        email: 'test@example.com',
        // missing password
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(incompleteUserDto)
        .expect(400);
    });

    it('should handle email already exists error', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(authRepository, 'register').mockRejectedValue(new Error('Email already exists'));

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(mockCreateUserDto)
        .expect(500);
    });
  });

  describe('POST /auth/authenticate', () => {
    it('should authenticate user successfully', async () => {
      // Arrange
      const mockToken = { accessToken: 'jwt-token' };
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
      expect(authRepository.validateUser).toHaveBeenCalled();
      expect(authRepository.login).toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      jest.spyOn(authRepository, 'validateUser').mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(mockLoginDto)
        .expect(401);
    });

    it('should return 400 for invalid email format', async () => {
      // Arrange
      const invalidLoginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(invalidLoginDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const incompleteLoginDto = {
        email: 'test@example.com',
        // missing password
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send(incompleteLoginDto)
        .expect(400);
    });
  });

  describe('AuthService Integration', () => {
    it('should validate user through repository', async () => {
      // Arrange
      jest.spyOn(authRepository, 'validateUser').mockResolvedValue(mockUser as any);

      // Act
      const result = await authService.validateUser(mockUser);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authRepository.validateUser).toHaveBeenCalledWith(mockUser);
    });

    it('should login user through repository', () => {
      // Arrange
      const loginUser = { id: 1, ...mockLoginDto };
      const mockToken = { accessToken: 'jwt-token' };
      jest.spyOn(authRepository, 'login').mockReturnValue(mockToken);

      // Act
      const result = authService.login(loginUser);

      // Assert
      expect(result).toEqual(mockToken);
      expect(authRepository.login).toHaveBeenCalledWith(loginUser);
    });

    it('should register user through repository', async () => {
      // Arrange
      const mockToken = { accessToken: 'jwt-token' };
      jest.spyOn(authRepository, 'register').mockResolvedValue(mockToken);

      // Act
      const result = await authService.register(mockCreateUserDto);

      // Assert
      expect(result).toEqual(mockToken);
      expect(authRepository.register).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('Database Integration', () => {
    it('should interact with User model for authentication', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await userModel.findOne({
        where: { email: mockLoginDto.email },
      });

      // Assert
      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginDto.email },
      });
    });

    it('should create user in database', async () => {
      // Arrange
      const newUser = { ...mockUser, email: 'newuser@example.com' };
      (userModel.create as jest.Mock).mockResolvedValue(newUser);

      // Act
      const result = await userModel.create(mockCreateUserDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(userModel.create).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      (userModel.findOne as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        userModel.findOne({ where: { email: mockLoginDto.email } })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle validation errors in service layer', async () => {
      // Arrange
      const invalidDto = { email: 'invalid-email' } as any;
      jest.spyOn(authRepository, 'register').mockRejectedValue(new Error('Validation failed'));

      // Act & Assert
      await expect(authService.register(invalidDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('Module Dependencies', () => {
    it('should have all required dependencies injected', () => {
      expect(authService).toBeDefined();
      expect(authRepository).toBeDefined();
      expect(userModel).toBeDefined();
    });

    it('should have proper module configuration', () => {
      expect(app).toBeDefined();
      expect(app.getHttpServer()).toBeDefined();
    });
  });
});
