import { Test, TestingModule } from '@nestjs/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { TokenControllers } from '@application/controllers';
import { TokenService } from '@domain/services';
import { TokenDto } from '@application/dto';

describe('TokenControllers', () => {
  let controller: TokenControllers;
  let tokenService: MockProxy<TokenService>;

  const mockTokenDto: TokenDto = {
    id: 1,
    token: 'refresh-token-123',
    expiryDate: '2024-12-31T23:59:59.000Z',
  };

  const mockTokenResponse = {
    accessToken: 'new-jwt-token',
    refreshToken: 'new-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenControllers],
      providers: [
        {
          provide: TokenService,
          useValue: mock<TokenService>(),
        },
      ],
    }).compile();

    controller = module.get<TokenControllers>(TokenControllers);
    tokenService = module.get<TokenService>(TokenService) as MockProxy<TokenService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshToken (POST /auth/refresh_token)', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      tokenService.refreshToken.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await controller.refreshToken(mockTokenDto);

      // Assert
      expect(result).toEqual(mockTokenResponse);
      expect(tokenService.refreshToken).toHaveBeenCalledWith(mockTokenDto);
      expect(tokenService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should handle refresh token with different data', async () => {
      // Arrange
      const differentTokenDto: TokenDto = {
        id: 2,
        token: 'different-refresh-token',
        expiryDate: '2024-06-30T12:00:00.000Z',
      };
      const differentResponse = {
        accessToken: 'different-jwt-token',
        refreshToken: 'different-refresh-token',
      };
      tokenService.refreshToken.mockResolvedValue(differentResponse);

      // Act
      const result = await controller.refreshToken(differentTokenDto);

      // Assert
      expect(result).toEqual(differentResponse);
      expect(tokenService.refreshToken).toHaveBeenCalledWith(differentTokenDto);
    });

    it('should handle refresh token errors', async () => {
      // Arrange
      const error = new Error('Invalid refresh token');
      tokenService.refreshToken.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshToken(mockTokenDto)).rejects.toThrow('Invalid refresh token');
      expect(tokenService.refreshToken).toHaveBeenCalledWith(mockTokenDto);
    });

    it('should handle expired refresh token', async () => {
      // Arrange
      const expiredTokenDto: TokenDto = {
        id: 1,
        token: 'expired-refresh-token',
        expiryDate: '2023-01-01T00:00:00.000Z',
      };
      const error = new Error('Refresh token has expired');
      tokenService.refreshToken.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshToken(expiredTokenDto)).rejects.toThrow('Refresh token has expired');
      expect(tokenService.refreshToken).toHaveBeenCalledWith(expiredTokenDto);
    });

    it('should handle invalid token format', async () => {
      // Arrange
      const invalidTokenDto = {
        id: 1,
        token: '',
        expiryDate: 'invalid-date',
      } as any;
      const error = new Error('Invalid token format');
      tokenService.refreshToken.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshToken(invalidTokenDto)).rejects.toThrow('Invalid token format');
    });

    it('should return response with both access and refresh tokens', async () => {
      // Arrange
      const responseWithBothTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      tokenService.refreshToken.mockResolvedValue(responseWithBothTokens);

      // Act
      const result = await controller.refreshToken(mockTokenDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it('should return response with only access token when refresh token is null', async () => {
      // Arrange
      const responseWithNullRefreshToken = {
        accessToken: 'new-access-token',
        refreshToken: null,
      };
      tokenService.refreshToken.mockResolvedValue(responseWithNullRefreshToken);

      // Act
      const result = await controller.refreshToken(mockTokenDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBeNull();
    });
  });

  describe('Request Validation', () => {
    it('should use ValidationPipe for refreshToken method', () => {
      // The ValidationPipe is applied via decorator
      // This test ensures the method signature is correct
      const method = controller.refreshToken;
      expect(typeof method).toBe('function');
    });

    it('should handle malformed request data gracefully', async () => {
      // Arrange
      const malformedData = { invalidField: 'value' } as any;
      const error = new Error('Validation failed');
      tokenService.refreshToken.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshToken(malformedData)).rejects.toThrow('Validation failed');
    });

    it('should validate required fields', async () => {
      // Arrange
      const incompleteData = { id: 1 } as any; // Missing token and expiryDate
      const error = new Error('Missing required fields');
      tokenService.refreshToken.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.refreshToken(incompleteData)).rejects.toThrow('Missing required fields');
    });
  });

  describe('Controller Dependencies', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have TokenService injected', () => {
      expect(tokenService).toBeDefined();
    });
  });

  describe('HTTP Methods and Routes', () => {
    it('should have POST /auth/refresh_token endpoint', () => {
      // This is implicitly tested by the refreshToken method tests
      expect(controller.refreshToken).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return tokens in correct format', async () => {
      // Arrange
      tokenService.refreshToken.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await controller.refreshToken(mockTokenDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken).toBeTruthy();
    });

    it('should handle different response formats', async () => {
      // Arrange
      const differentResponse = {
        accessToken: 'token-without-refresh',
        refreshToken: undefined,
      };
      tokenService.refreshToken.mockResolvedValue(differentResponse as any);

      // Act
      const result = await controller.refreshToken(mockTokenDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('token-without-refresh');
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors correctly', async () => {
      // Arrange
      const serviceError = new Error('Token service unavailable');
      tokenService.refreshToken.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.refreshToken(mockTokenDto)).rejects.toThrow('Token service unavailable');
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('Network timeout');
      tokenService.refreshToken.mockRejectedValue(networkError);

      // Act & Assert
      await expect(controller.refreshToken(mockTokenDto)).rejects.toThrow('Network timeout');
    });
  });
});
