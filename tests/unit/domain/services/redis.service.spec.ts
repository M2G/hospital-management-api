import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import RedisService from '@domain/services/cache/redis.service';
import { RedisRepository } from '@infrastructure/repository';
import { UserEntity as User } from '@domain/entities';
import RedisPrefixEnum from '@domain/enum';

describe('RedisService', () => {
  let service: RedisService;
  let redisRepository: MockProxy<RedisRepository>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password: 'hashedPassword',
    created_at: new Date(),
    modified_at: new Date(),
    deleted_at: 0,
    last_connected_at: 0,
    reset_password_expires: '',
    reset_password_token: null,
  };

  const mockUsers: User[] = [mockUser];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: RedisRepository,
          useValue: mock<RedisRepository>(),
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisRepository = module.get<RedisRepository>(RedisRepository) as MockProxy<RedisRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findLastUserConnected', () => {
    it('should return async iterable for scanning last connected users', () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn().mockResolvedValue({ done: true, value: undefined }),
        }),
      };
      redisRepository.scanIterator.mockReturnValue(mockIterator as any);

      // Act
      const result = service.findLastUserConnected();

      // Assert
      expect(result).toBe(mockIterator);
      expect(redisRepository.scanIterator).toHaveBeenCalledWith(RedisPrefixEnum.LAST_CONNECTED_AT);
      expect(redisRepository.scanIterator).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveLastUserConnected', () => {
    it('should save last connected user with correct key and expiry', () => {
      // Arrange
      const userId = 1;
      const expectedKey = `${RedisPrefixEnum.LAST_CONNECTED_AT}:${userId}`;
      const expectedValue = JSON.stringify({
        id: userId,
        last_connected_at: Math.floor(Date.now() / 1000),
      });
      const expectedExpiry = service.TIME_EXPIRATION * service.TIME_EXPIRATION;

      // Act
      service.saveLastUserConnected(userId);

      // Assert
      expect(redisRepository.setWithExpiry).toHaveBeenCalledWith(
        expectedKey,
        expectedValue,
        expectedExpiry,
      );
      expect(redisRepository.setWithExpiry).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined userId', () => {
      // Arrange
      const userId = undefined;
      const expectedKey = `${RedisPrefixEnum.LAST_CONNECTED_AT}:${userId}`;

      // Act
      service.saveLastUserConnected(userId);

      // Assert
      expect(redisRepository.setWithExpiry).toHaveBeenCalledWith(
        expectedKey,
        expect.any(String),
        expect.any(Number),
      );
    });
  });

  describe('findLastUserConnectected', () => {
    it('should get user data by key', async () => {
      // Arrange
      const key = ['last_connected_at:1'];
      const expectedData = JSON.stringify({
        id: 1,
        last_connected_at: 1234567890,
      });
      redisRepository.get.mockResolvedValue(expectedData);

      // Act
      const result = await service.findLastUserConnectected(key);

      // Assert
      expect(result).toBe(expectedData);
      expect(redisRepository.get).toHaveBeenCalledWith(key);
      expect(redisRepository.get).toHaveBeenCalledTimes(1);
    });

    it('should return null when no data found', async () => {
      // Arrange
      const key = ['last_connected_at:999'];
      redisRepository.get.mockResolvedValue(null);

      // Act
      const result = await service.findLastUserConnectected(key);

      // Assert
      expect(result).toBeNull();
      expect(redisRepository.get).toHaveBeenCalledWith(key);
    });
  });

  describe('findUser', () => {
    it('should get user by id', async () => {
      // Arrange
      const userId = '1';
      const expectedKey = `${RedisPrefixEnum.USER}:${userId}`;
      const expectedData = JSON.stringify(mockUser);
      redisRepository.get.mockResolvedValue(expectedData);

      // Act
      const result = await service.findUser(userId);

      // Assert
      expect(result).toBe(expectedData);
      expect(redisRepository.get).toHaveBeenCalledWith(expectedKey);
      expect(redisRepository.get).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = '999';
      const expectedKey = `${RedisPrefixEnum.USER}:${userId}`;
      redisRepository.get.mockResolvedValue(null);

      // Act
      const result = await service.findUser(userId);

      // Assert
      expect(result).toBeNull();
      expect(redisRepository.get).toHaveBeenCalledWith(expectedKey);
    });
  });

  describe('saveUser', () => {
    it('should save user with correct key and expiry', () => {
      // Arrange
      const expectedKey = `${RedisPrefixEnum.USER}:${mockUser.id}`;
      const expectedValue = JSON.stringify(mockUser);
      const expectedExpiry = service.TIME_EXPIRATION;

      // Act
      service.saveUser(mockUser);

      // Assert
      expect(redisRepository.setWithExpiry).toHaveBeenCalledWith(
        expectedKey,
        expectedValue,
        expectedExpiry,
      );
      expect(redisRepository.setWithExpiry).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUsers', () => {
    it('should get all users', async () => {
      // Arrange
      const expectedData = JSON.stringify(mockUsers);
      redisRepository.get.mockResolvedValue(expectedData);

      // Act
      const result = await service.findUsers();

      // Assert
      expect(result).toBe(expectedData);
      expect(redisRepository.get).toHaveBeenCalledWith(RedisPrefixEnum.USERS);
      expect(redisRepository.get).toHaveBeenCalledTimes(1);
    });

    it('should return null when no users found', async () => {
      // Arrange
      redisRepository.get.mockResolvedValue(null);

      // Act
      const result = await service.findUsers();

      // Assert
      expect(result).toBeNull();
      expect(redisRepository.get).toHaveBeenCalledWith(RedisPrefixEnum.USERS);
    });
  });

  describe('saveUsers', () => {
    it('should save users array with correct key and expiry', () => {
      // Arrange
      const expectedKey = RedisPrefixEnum.USERS;
      const expectedValue = JSON.stringify(mockUsers);
      const expectedExpiry = service.TIME_EXPIRATION;

      // Act
      service.saveUsers(mockUsers);

      // Assert
      expect(redisRepository.setWithExpiry).toHaveBeenCalledWith(
        expectedKey,
        expectedValue,
        expectedExpiry,
      );
      expect(redisRepository.setWithExpiry).toHaveBeenCalledTimes(1);
    });

    it('should handle empty users array', () => {
      // Arrange
      const emptyUsers: User[] = [];
      const expectedKey = RedisPrefixEnum.USERS;
      const expectedValue = JSON.stringify(emptyUsers);
      const expectedExpiry = service.TIME_EXPIRATION;

      // Act
      service.saveUsers(emptyUsers);

      // Assert
      expect(redisRepository.setWithExpiry).toHaveBeenCalledWith(
        expectedKey,
        expectedValue,
        expectedExpiry,
      );
    });
  });

  describe('removeUser', () => {
    it('should delete user by id', async () => {
      // Arrange
      const userId = 1;
      const expectedKey = `${RedisPrefixEnum.USER}:${userId}`;
      redisRepository.delete.mockResolvedValue('1');

      // Act
      const result = await service.removeUser(userId);

      // Assert
      expect(result).toBe('1');
      expect(redisRepository.delete).toHaveBeenCalledWith(expectedKey);
      expect(redisRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent user', async () => {
      // Arrange
      const userId = 999;
      const expectedKey = `${RedisPrefixEnum.USER}:${userId}`;
      redisRepository.delete.mockResolvedValue('0');

      // Act
      const result = await service.removeUser(userId);

      // Assert
      expect(result).toBe('0');
      expect(redisRepository.delete).toHaveBeenCalledWith(expectedKey);
    });
  });

  describe('TIME_EXPIRATION', () => {
    it('should have correct default expiry time', () => {
      // Assert
      expect(service.TIME_EXPIRATION).toBe(60);
    });
  });
});