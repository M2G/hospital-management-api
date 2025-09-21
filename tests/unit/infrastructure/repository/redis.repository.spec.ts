import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import RedisRepository from '@infrastructure/repository/cache/redis.repository';
import { RedisClient, REDIS_CLIENT } from 'src/config/redis-client.type';

describe('RedisRepository', () => {
  let repository: RedisRepository;
  let redisClient: MockProxy<RedisClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisRepository,
        {
          provide: REDIS_CLIENT,
          useValue: mock<RedisClient>(),
        },
      ],
    }).compile();

    repository = module.get<RedisRepository>(RedisRepository);
    redisClient = module.get<RedisClient>(REDIS_CLIENT) as MockProxy<RedisClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleDestroy', () => {
    it('should close redis connection on module destroy', () => {
      // Arrange
      redisClient.quit.mockResolvedValue('OK');

      // Act
      repository.onModuleDestroy();

      // Assert
      expect(redisClient.quit).toHaveBeenCalledTimes(1);
    });

    it('should handle quit errors gracefully', () => {
      // Arrange
      const error = new Error('Connection already closed');
      redisClient.quit.mockRejectedValue(error);

      // Act
      repository.onModuleDestroy();

      // Assert
      expect(redisClient.quit).toHaveBeenCalledTimes(1);
      // The method should not throw, it should handle errors gracefully
    });
  });

  describe('scanIterator', () => {
    it('should return async iterable with correct options', () => {
      // Arrange
      const keyMatch = 'user:*';
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn().mockResolvedValue({ done: true, value: undefined }),
        }),
      };
      redisClient.scanIterator.mockReturnValue(mockIterator as any);

      // Act
      const result = repository.scanIterator(keyMatch);

      // Assert
      expect(result).toBe(mockIterator);
      expect(redisClient.scanIterator).toHaveBeenCalledWith({
        COUNT: 100,
        MATCH: keyMatch,
      });
      expect(redisClient.scanIterator).toHaveBeenCalledTimes(1);
    });

    it('should handle different key patterns', () => {
      // Arrange
      const keyMatch1 = 'last_connected_at:*';
      const keyMatch2 = 'session:*';
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn().mockResolvedValue({ done: true, value: undefined }),
        }),
      };
      redisClient.scanIterator.mockReturnValue(mockIterator as any);

      // Act
      const result1 = repository.scanIterator(keyMatch1);
      const result2 = repository.scanIterator(keyMatch2);

      // Assert
      expect(result1).toBe(mockIterator);
      expect(result2).toBe(mockIterator);
      expect(redisClient.scanIterator).toHaveBeenCalledWith({
        COUNT: 100,
        MATCH: keyMatch1,
      });
      expect(redisClient.scanIterator).toHaveBeenCalledWith({
        COUNT: 100,
        MATCH: keyMatch2,
      });
    });
  });

  describe('get', () => {
    it('should get value by key', async () => {
      // Arrange
      const key = 'user:1';
      const value = '{"id":1,"name":"John"}';
      redisClient.get.mockResolvedValue(value);

      // Act
      const result = await repository.get(key);

      // Assert
      expect(result).toBe(value);
      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(redisClient.get).toHaveBeenCalledTimes(1);
    });

    it('should return null when key does not exist', async () => {
      // Arrange
      const key = 'nonexistent:key';
      redisClient.get.mockResolvedValue(null);

      // Act
      const result = await repository.get(key);

      // Assert
      expect(result).toBeNull();
      expect(redisClient.get).toHaveBeenCalledWith(key);
    });

    it('should handle different key types', async () => {
      // Arrange
      const key1 = 'user:1';
      const key2 = 'session:abc123';
      const value1 = 'user_data';
      const value2 = 'session_data';
      redisClient.get
        .mockResolvedValueOnce(value1)
        .mockResolvedValueOnce(value2);

      // Act
      const result1 = await repository.get(key1);
      const result2 = await repository.get(key2);

      // Assert
      expect(result1).toBe(value1);
      expect(result2).toBe(value2);
      expect(redisClient.get).toHaveBeenCalledWith(key1);
      expect(redisClient.get).toHaveBeenCalledWith(key2);
    });

    it('should handle redis errors', async () => {
      // Arrange
      const key = 'user:1';
      const error = new Error('Redis connection failed');
      redisClient.get.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.get(key)).rejects.toThrow('Redis connection failed');
      expect(redisClient.get).toHaveBeenCalledWith(key);
    });
  });

  describe('set', () => {
    it('should set value by key', async () => {
      // Arrange
      const key = 'user:1';
      const value = '{"id":1,"name":"John"}';
      redisClient.set.mockResolvedValue('OK');

      // Act
      await repository.set(key, value);

      // Assert
      expect(redisClient.set).toHaveBeenCalledWith(key, value);
      expect(redisClient.set).toHaveBeenCalledTimes(1);
    });

    it('should handle different value types', async () => {
      // Arrange
      const key1 = 'user:1';
      const key2 = 'session:abc123';
      const value1 = 'user_data';
      const value2 = '{"sessionId":"abc123","userId":1}';
      redisClient.set.mockResolvedValue('OK');

      // Act
      await repository.set(key1, value1);
      await repository.set(key2, value2);

      // Assert
      expect(redisClient.set).toHaveBeenCalledWith(key1, value1);
      expect(redisClient.set).toHaveBeenCalledWith(key2, value2);
      expect(redisClient.set).toHaveBeenCalledTimes(2);
    });

    it('should handle redis errors', async () => {
      // Arrange
      const key = 'user:1';
      const value = 'user_data';
      const error = new Error('Redis write failed');
      redisClient.set.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.set(key, value)).rejects.toThrow('Redis write failed');
      expect(redisClient.set).toHaveBeenCalledWith(key, value);
    });
  });

  describe('delete', () => {
    it('should delete key', async () => {
      // Arrange
      const key = 'user:1';
      redisClient.del.mockResolvedValue(1);

      // Act
      const result = await repository.delete(key);

      // Assert
      expect(result).toBe(1);
      expect(redisClient.del).toHaveBeenCalledWith(key);
      expect(redisClient.del).toHaveBeenCalledTimes(1);
    });

    it('should return 0 when key does not exist', async () => {
      // Arrange
      const key = 'nonexistent:key';
      redisClient.del.mockResolvedValue(0);

      // Act
      const result = await repository.delete(key);

      // Assert
      expect(result).toBe(0);
      expect(redisClient.del).toHaveBeenCalledWith(key);
    });

    it('should handle multiple key deletions', async () => {
      // Arrange
      const key1 = 'user:1';
      const key2 = 'user:2';
      redisClient.del
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);

      // Act
      const result1 = await repository.delete(key1);
      const result2 = await repository.delete(key2);

      // Assert
      expect(result1).toBe(1);
      expect(result2).toBe(1);
      expect(redisClient.del).toHaveBeenCalledWith(key1);
      expect(redisClient.del).toHaveBeenCalledWith(key2);
    });

    it('should handle redis errors', async () => {
      // Arrange
      const key = 'user:1';
      const error = new Error('Redis delete failed');
      redisClient.del.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.delete(key)).rejects.toThrow('Redis delete failed');
      expect(redisClient.del).toHaveBeenCalledWith(key);
    });
  });

  describe('setWithExpiry', () => {
    it('should set value with expiry', async () => {
      // Arrange
      const key = 'user:1';
      const value = '{"id":1,"name":"John"}';
      const expiry = 3600; // 1 hour
      redisClient.set.mockResolvedValue('OK');

      // Act
      await repository.setWithExpiry(key, value, expiry);

      // Assert
      expect(redisClient.set).toHaveBeenCalledWith(key, value, { EX: expiry });
      expect(redisClient.set).toHaveBeenCalledTimes(1);
    });

    it('should handle different expiry times', async () => {
      // Arrange
      const key1 = 'user:1';
      const key2 = 'session:abc123';
      const value1 = 'user_data';
      const value2 = 'session_data';
      const expiry1 = 3600; // 1 hour
      const expiry2 = 1800; // 30 minutes
      redisClient.set.mockResolvedValue('OK');

      // Act
      await repository.setWithExpiry(key1, value1, expiry1);
      await repository.setWithExpiry(key2, value2, expiry2);

      // Assert
      expect(redisClient.set).toHaveBeenCalledWith(key1, value1, { EX: expiry1 });
      expect(redisClient.set).toHaveBeenCalledWith(key2, value2, { EX: expiry2 });
      expect(redisClient.set).toHaveBeenCalledTimes(2);
    });

    it('should handle zero expiry', async () => {
      // Arrange
      const key = 'user:1';
      const value = 'user_data';
      const expiry = 0;
      redisClient.set.mockResolvedValue('OK');

      // Act
      await repository.setWithExpiry(key, value, expiry);

      // Assert
      expect(redisClient.set).toHaveBeenCalledWith(key, value, { EX: expiry });
    });

    it('should handle redis errors', async () => {
      // Arrange
      const key = 'user:1';
      const value = 'user_data';
      const expiry = 3600;
      const error = new Error('Redis set with expiry failed');
      redisClient.set.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.setWithExpiry(key, value, expiry)).rejects.toThrow('Redis set with expiry failed');
      expect(redisClient.set).toHaveBeenCalledWith(key, value, { EX: expiry });
    });
  });

  describe('Repository Interface Compliance', () => {
    it('should implement ICacheRepository interface', () => {
      // This test ensures the repository implements all required methods
      expect(typeof repository.scanIterator).toBe('function');
      expect(typeof repository.get).toBe('function');
      expect(typeof repository.set).toBe('function');
      expect(typeof repository.delete).toBe('function');
      expect(typeof repository.setWithExpiry).toBe('function');
      expect(typeof repository.onModuleDestroy).toBe('function');
    });
  });
});
