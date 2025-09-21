import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import TaskService from '@domain/services/task/task.service';
import { RedisService } from '@domain/services';
import { User } from '@infrastructure/models';
import { getModelToken } from '@nestjs/sequelize';

describe('TaskService', () => {
  let service: TaskService;
  let redisService: MockProxy<RedisService>;
  let userModel: MockProxy<typeof User>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password: 'hashedPassword',
    created_at: new Date(),
    modified_at: new Date(),
    deleted_at: 0,
    last_connected_at: 1234567890,
    reset_password_expires: '',
    reset_password_token: null,
  };

  const mockRedisData = JSON.stringify({
    id: 1,
    last_connected_at: 1234567890,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: RedisService,
          useValue: mock<RedisService>(),
        },
        {
          provide: getModelToken(User),
          useValue: mock<typeof User>(),
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    redisService = module.get<RedisService>(RedisService) as MockProxy<RedisService>;
    userModel = module.get<typeof User>(getModelToken(User)) as MockProxy<typeof User>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('lastConnectedUser', () => {
    it('should update user last connected time successfully', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: ['last_connected_at:1'] })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);
      redisService.findLastUserConnectected.mockResolvedValue(mockRedisData);
      userModel.update.mockResolvedValue([1] as any);

      // Act
      const result = await service.lastConnectedUser();

      // Assert
      expect(result).toBe(true);
      expect(redisService.findLastUserConnected).toHaveBeenCalledTimes(1);
      expect(redisService.findLastUserConnectected).toHaveBeenCalledWith(['last_connected_at:1']);
      expect(userModel.update).toHaveBeenCalledWith(
        {
          id: 1,
          last_connected_at: 1234567890,
        },
        {
          where: { id: 1 },
        },
      );
    });

    it('should return null when no keys found', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn().mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);

      // Act
      const result = await service.lastConnectedUser();

      // Assert
      expect(result).toBeNull();
      expect(redisService.findLastUserConnected).toHaveBeenCalledTimes(1);
      expect(redisService.findLastUserConnectected).not.toHaveBeenCalled();
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it('should return null when key is empty', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: [] })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);

      // Act
      const result = await service.lastConnectedUser();

      // Assert
      expect(result).toBeNull();
      expect(redisService.findLastUserConnected).toHaveBeenCalledTimes(1);
      expect(redisService.findLastUserConnectected).not.toHaveBeenCalled();
      expect(userModel.update).not.toHaveBeenCalled();
    });

    it('should return false when user update fails', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: ['last_connected_at:1'] })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);
      redisService.findLastUserConnectected.mockResolvedValue(mockRedisData);
      userModel.update.mockResolvedValue([0] as any);

      // Act
      const result = await service.lastConnectedUser();

      // Assert
      expect(result).toBe(false);
      expect(redisService.findLastUserConnected).toHaveBeenCalledTimes(1);
      expect(redisService.findLastUserConnectected).toHaveBeenCalledWith(['last_connected_at:1']);
      expect(userModel.update).toHaveBeenCalledWith(
        {
          id: 1,
          last_connected_at: 1234567890,
        },
        {
          where: { id: 1 },
        },
      );
    });

    it('should handle multiple users', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: ['last_connected_at:1'] })
            .mockResolvedValueOnce({ done: false, value: ['last_connected_at:2'] })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);
      redisService.findLastUserConnectected
        .mockResolvedValueOnce(JSON.stringify({ id: 1, last_connected_at: 1234567890 }))
        .mockResolvedValueOnce(JSON.stringify({ id: 2, last_connected_at: 1234567891 }));
      userModel.update
        .mockResolvedValueOnce([1] as any)
        .mockResolvedValueOnce([1] as any);

      // Act
      const result = await service.lastConnectedUser();

      // Assert
      expect(result).toBe(true);
      expect(redisService.findLastUserConnected).toHaveBeenCalledTimes(1);
      expect(redisService.findLastUserConnectected).toHaveBeenCalledTimes(2);
      expect(userModel.update).toHaveBeenCalledTimes(2);
    });

    it('should handle redis service errors', async () => {
      // Arrange
      const error = new Error('Redis connection failed');
      redisService.findLastUserConnected.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(service.lastConnectedUser()).rejects.toThrow('Redis connection failed');
    });

    it('should handle database update errors', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: ['last_connected_at:1'] })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);
      redisService.findLastUserConnectected.mockResolvedValue(mockRedisData);
      const dbError = new Error('Database connection failed');
      userModel.update.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.lastConnectedUser()).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid JSON data', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: ['last_connected_at:1'] })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);
      redisService.findLastUserConnectected.mockResolvedValue('invalid-json');

      // Act & Assert
      await expect(service.lastConnectedUser()).rejects.toThrow();
    });

    it('should handle null redis data', async () => {
      // Arrange
      const mockIterator = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          next: jest.fn()
            .mockResolvedValueOnce({ done: false, value: ['last_connected_at:1'] })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      };
      redisService.findLastUserConnected.mockReturnValue(mockIterator as any);
      redisService.findLastUserConnectected.mockResolvedValue(null);

      // Act
      const result = await service.lastConnectedUser();

      // Assert
      expect(result).toBeNull();
      expect(redisService.findLastUserConnected).toHaveBeenCalledTimes(1);
      expect(redisService.findLastUserConnectected).toHaveBeenCalledWith(['last_connected_at:1']);
      expect(userModel.update).not.toHaveBeenCalled();
    });
  });

  describe('handleCron', () => {
    it('should call lastConnectedUser and log debug message', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const lastConnectedUserSpy = jest.spyOn(service, 'lastConnectedUser').mockResolvedValue(true);

      // Act
      service.handleCron();

      // Assert
      expect(lastConnectedUserSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('ok', 1);
      
      // Cleanup
      consoleSpy.mockRestore();
    });

    it('should handle errors in cron job gracefully', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const lastConnectedUserSpy = jest.spyOn(service, 'lastConnectedUser').mockRejectedValue(new Error('Test error'));

      // Act
      service.handleCron();

      // Assert
      expect(lastConnectedUserSpy).toHaveBeenCalledTimes(1);
      // The method should not throw, it should handle errors gracefully
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});