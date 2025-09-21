# Testing Documentation

This document provides comprehensive information about the testing setup and strategies for the NestJS DDD project.

## Overview

The project implements a comprehensive testing strategy with three levels of testing:

1. **Unit Tests** - Test individual components in isolation
2. **Integration Tests** - Test module interactions and data flow
3. **End-to-End (E2E) Tests** - Test complete user workflows

## Test Structure

```
tests/
├── unit/                          # Unit tests
│   ├── domain/
│   │   └── services/              # Domain service tests
│   ├── application/
│   │   └── controllers/           # Controller tests
│   └── infrastructure/
│       └── repository/            # Repository tests
├── inte/                          # Integration tests
│   ├── auth.integration.spec.ts
│   └── users.integration.spec.ts
├── e2e/                           # End-to-end tests
│   ├── auth.e2e.spec.ts
│   └── users.e2e.spec.ts
├── setup/                         # Test utilities and setup
│   └── test-setup.ts
├── scripts/                       # Test execution scripts
│   └── run-tests.sh
├── mocks/                         # Mock data and services
│   ├── index.ts
│   ├── mockService.ts
│   ├── redis-mock.ts
│   ├── redis-service-mock.ts
│   └── userData.mock.ts
├── coverage/                      # Coverage reports (generated)
├── jest.config.js                 # Jest configuration
└── jest-e2e.json                  # E2E Jest configuration
```

## Test Types

### Unit Tests

Unit tests focus on testing individual components in isolation with mocked dependencies.

**Location**: `tests/unit/`

**Coverage**:
- Domain services (`AuthService`, `UserService`, `RedisService`, `TaskService`)
- Application controllers (`AuthController`, `UsersController`, `TokenController`)
- Infrastructure repositories (`RedisRepository`)

**Key Features**:
- Mocked dependencies using `jest-mock-extended`
- Isolated component testing
- Fast execution
- High coverage of business logic

### Integration Tests

Integration tests verify that different modules work together correctly.

**Location**: `tests/inte/`

**Coverage**:
- Module interactions
- Database integration
- Service layer integration
- Authentication flow

**Key Features**:
- Real module dependencies
- Database interactions
- Service-to-service communication
- Data flow validation

### End-to-End Tests

E2E tests verify complete user workflows through HTTP requests.

**Location**: `tests/e2e/`

**Coverage**:
- Complete user journeys
- API endpoint testing
- Authentication flows
- Error handling
- Security testing

**Key Features**:
- Full application stack testing
- HTTP request/response validation
- User workflow simulation
- Performance testing

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with watch mode
npm run test:unit:watch
npm run test:integration:watch

# Run with coverage
npm run test:unit:cov
npm run test:integration:cov

# Run all test types
npm run test:all

# Run all with coverage
npm run test:all:cov

# CI mode (no watch, with coverage)
npm run test:ci
```

### Using the Test Runner Script

```bash
# Run all tests
./tests/scripts/run-tests.sh

# Run specific test type
./tests/scripts/run-tests.sh --type unit
./tests/scripts/run-tests.sh --type integration
./tests/scripts/run-tests.sh --type e2e

# Run with coverage
./tests/scripts/run-tests.sh --coverage

# Run in watch mode
./tests/scripts/run-tests.sh --watch

# Run with verbose output
./tests/scripts/run-tests.sh --verbose

# Run in parallel
./tests/scripts/run-tests.sh --parallel

# Get help
./tests/scripts/run-tests.sh --help
```

## Test Configuration

### Jest Configuration

The project uses two Jest configurations:

1. **Main Configuration** (`jest.config.js`):
   - Unit and integration tests
   - TypeScript support with `ts-jest`
   - Coverage collection
   - Module path mapping

2. **E2E Configuration** (`tests/jest-e2e.json`):
   - End-to-end tests only
   - Separate test environment
   - Different timeout settings

### Environment Setup

Tests use a separate test environment with:

- Test database configuration
- Mock external services
- Test-specific environment variables
- Isolated test data

## Test Utilities

### Test Setup (`tests/setup/test-setup.ts`)

Provides utilities for:
- Creating test modules
- Generating mock data
- Setting up test applications
- Common test assertions

### Mock Data (`tests/mocks/`)

Contains:
- User data mocks
- Service mocks
- Redis mocks
- Database mocks

## Coverage Reports

Coverage reports are generated in the `tests/coverage/` directory:

- **HTML Report**: `tests/coverage/lcov-report/index.html`
- **LCOV Report**: `tests/coverage/lcov.info`
- **JSON Report**: `tests/coverage/coverage-final.json`

### Coverage Targets

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Best Practices

### Writing Unit Tests

1. **Isolate Components**: Mock all dependencies
2. **Test Behavior**: Focus on what the component does, not how
3. **Use Descriptive Names**: Test names should describe the scenario
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Test Edge Cases**: Include error scenarios and boundary conditions

### Writing Integration Tests

1. **Test Real Interactions**: Use real implementations where possible
2. **Test Data Flow**: Verify data flows correctly between components
3. **Test Error Propagation**: Ensure errors are handled properly
4. **Use Test Database**: Isolate test data from production

### Writing E2E Tests

1. **Test User Journeys**: Focus on complete user workflows
2. **Test API Contracts**: Verify request/response formats
3. **Test Error Handling**: Include error scenarios
4. **Test Security**: Include security-related test cases
5. **Test Performance**: Include load and performance tests

## Debugging Tests

### Debug Mode

```bash
# Debug unit tests
npm run test:debug

# Debug specific test file
npm run test:debug -- --testNamePattern="AuthService"
```

### Verbose Output

```bash
# Verbose test output
npm test -- --verbose

# Using test runner
./tests/scripts/run-tests.sh --verbose
```

### Test Isolation

```bash
# Run single test file
npm test -- tests/unit/domain/services/auth.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should login user"
```

## Continuous Integration

### GitHub Actions

The project includes CI configuration for automated testing:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

### Pre-commit Hooks

Tests run automatically before commits:

```bash
# Install pre-commit hooks
npm run prepare

# Run tests before commit
npm run test:unit
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure test database is running
2. **Port Conflicts**: Check for port conflicts in test environment
3. **Mock Issues**: Verify mock implementations match interfaces
4. **Timeout Issues**: Increase timeout for slow tests
5. **Memory Issues**: Use `--maxWorkers` to limit parallel tests

### Debug Commands

```bash
# Check test configuration
npm test -- --showConfig

# Run tests with debug output
DEBUG=* npm test

# Check coverage thresholds
npm run test:cov -- --coverageThreshold='{"global":{"statements":90}}'
```

## Performance Considerations

### Test Execution Speed

- Unit tests: < 1 second per test
- Integration tests: < 5 seconds per test
- E2E tests: < 10 seconds per test

### Parallel Execution

```bash
# Run tests in parallel
npm test -- --maxWorkers=4

# Using test runner
./tests/scripts/run-tests.sh --parallel
```

### Memory Usage

- Monitor memory usage during test execution
- Use `--maxWorkers` to limit parallel execution
- Clean up resources in `afterEach`/`afterAll` hooks

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep testing libraries up to date
2. **Review Coverage**: Ensure coverage targets are met
3. **Refactor Tests**: Keep tests maintainable and readable
4. **Update Mocks**: Keep mocks in sync with real implementations
5. **Performance Monitoring**: Monitor test execution times

### Test Data Management

1. **Isolate Test Data**: Use separate test database
2. **Clean Up**: Clean test data after each test
3. **Seed Data**: Use consistent seed data for tests
4. **Mock External Services**: Avoid external dependencies in tests

## Contributing

When adding new features:

1. **Write Tests First**: Follow TDD approach
2. **Update Mocks**: Update mocks for new interfaces
3. **Add E2E Tests**: Include end-to-end tests for new features
4. **Update Documentation**: Keep this documentation up to date
5. **Check Coverage**: Ensure new code is covered by tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
