import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { I18nModule } from 'nestjs-i18n';
import { join } from 'path';

/**
 * Test setup utilities for creating consistent test environments
 */
export class TestSetup {
  /**
   * Creates a basic NestJS testing module with common dependencies
   */
  static async createBasicModule(modules: any[] = []) {
    return Test.createTestingModule({
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
        ...modules,
      ],
    });
  }

  /**
   * Creates a test application with global pipes
   */
  static async createTestApp(moduleFixture: TestingModule): Promise<INestApplication> {
    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    return app;
  }

  /**
   * Generates mock JWT token for testing
   */
  static generateMockToken(): string {
    return 'Bearer mock-jwt-token';
  }

  /**
   * Generates mock user data
   */
  static generateMockUser(overrides: Partial<any> = {}) {
    return {
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
      ...overrides,
    };
  }

  /**
   * Generates mock pagination result
   */
  static generateMockPaginationResult(users: any[] = []) {
    return {
      pageInfo: {
        count: users.length,
        next: null,
        pages: 1,
        prev: null,
      },
      results: users,
    };
  }

  /**
   * Generates mock DTOs
   */
  static generateMockDtos() {
    return {
      createUser: {
        email: 'newuser@example.com',
        password: 'password123',
      },
      login: {
        email: 'test@example.com',
        password: 'password123',
      },
      updateUser: {
        first_name: 'Jane',
        last_name: 'Smith',
      },
      forgotPassword: {
        email: 'test@example.com',
      },
      resetPassword: {
        token: 'valid-token',
        password: 'newpassword123',
      },
      changePassword: {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      },
    };
  }

  /**
   * Sets up database mocks
   */
  static setupDatabaseMocks(userModel: any) {
    return {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
    };
  }

  /**
   * Cleans up test environment
   */
  static async cleanup(app: INestApplication) {
    if (app) {
      await app.close();
    }
  }

  /**
   * Waits for async operations to complete
   */
  static async waitFor(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Test data factories for generating consistent test data
 */
export class TestDataFactory {
  /**
   * Creates multiple users for testing
   */
  static createUsers(count: number, baseEmail: string = 'user') {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      email: `${baseEmail}${i + 1}@example.com`,
      password: 'password123',
      first_name: `User${i + 1}`,
      last_name: 'Test',
      created_at: new Date(),
      modified_at: new Date(),
      deleted_at: 0,
      last_connected_at: 0,
      reset_password_expires: '',
      reset_password_token: null,
    }));
  }

  /**
   * Creates pagination data
   */
  static createPaginationData(totalCount: number, pageSize: number, currentPage: number = 1) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    return {
      pageInfo: {
        count: totalCount,
        next: hasNext ? currentPage + 1 : null,
        pages: totalPages,
        prev: hasPrev ? currentPage - 1 : null,
      },
      results: TestDataFactory.createUsers(Math.min(pageSize, totalCount)),
    };
  }

  /**
   * Creates error scenarios
   */
  static createErrorScenarios() {
    return {
      databaseConnection: new Error('Database connection failed'),
      validationError: new Error('Validation failed'),
      notFound: new Error('Resource not found'),
      unauthorized: new Error('Unauthorized access'),
      conflict: new Error('Resource already exists'),
    };
  }

  /**
   * Creates malicious input for security testing
   */
  static createMaliciousInput() {
    return {
      sqlInjection: "'; DROP TABLE users; --",
      xss: '<script>alert("xss")</script>',
      longString: 'A'.repeat(10000),
      specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      unicode: '🚀💻🎉',
    };
  }
}

/**
 * Test assertions helpers
 */
export class TestAssertions {
  /**
   * Asserts that a response has the correct user structure
   */
  static assertUserStructure(user: any) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('first_name');
    expect(user).toHaveProperty('last_name');
    expect(user).toHaveProperty('created_at');
    expect(user).toHaveProperty('modified_at');
    expect(typeof user.id).toBe('number');
    expect(typeof user.email).toBe('string');
    expect(typeof user.first_name).toBe('string');
    expect(typeof user.last_name).toBe('string');
  }

  /**
   * Asserts that a response has the correct pagination structure
   */
  static assertPaginationStructure(pagination: any) {
    expect(pagination).toHaveProperty('pageInfo');
    expect(pagination).toHaveProperty('results');
    expect(pagination.pageInfo).toHaveProperty('count');
    expect(pagination.pageInfo).toHaveProperty('next');
    expect(pagination.pageInfo).toHaveProperty('pages');
    expect(pagination.pageInfo).toHaveProperty('prev');
    expect(Array.isArray(pagination.results)).toBe(true);
  }

  /**
   * Asserts that a response has the correct auth token structure
   */
  static assertAuthTokenStructure(token: any) {
    expect(token).toHaveProperty('accessToken');
    expect(typeof token.accessToken).toBe('string');
    expect(token.accessToken).toBeTruthy();
  }

  /**
   * Asserts that an error response doesn't expose sensitive information
   */
  static assertSecureErrorResponse(response: any) {
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toHaveProperty('message');
    expect(JSON.stringify(response.body)).not.toContain('Database');
    expect(JSON.stringify(response.body)).not.toContain('Error');
  }
}

/**
 * Test environment configuration
 */
export const TestConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'test_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret',
    expiresIn: '1h',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  timeout: {
    default: 10000,
    long: 30000,
  },
};
