#!/bin/bash

# Test runner script for the NestJS DDD project
# This script provides different test execution options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
COVERAGE=false
WATCH=false
VERBOSE=false
PARALLEL=false

# Function to display help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --type TYPE        Test type: unit, integration, e2e, all (default: all)"
    echo "  -c, --coverage         Run with coverage report"
    echo "  -w, --watch            Run in watch mode"
    echo "  -v, --verbose          Verbose output"
    echo "  -p, --parallel         Run tests in parallel"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --type unit --coverage"
    echo "  $0 --type e2e --verbose"
    echo "  $0 --watch"
    echo "  $0 --type all --coverage --parallel"
}

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup test environment
setup_test_env() {
    print_status $BLUE "Setting up test environment..."
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_status $RED "Error: Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_status $RED "Error: npm is not installed"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status $YELLOW "Installing dependencies..."
        npm install
    fi
    
    # Create test environment file if it doesn't exist
    if [ ! -f ".env.test" ]; then
        print_status $YELLOW "Creating .env.test file..."
        cat > .env.test << EOF
# Test Environment Configuration
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=test_db
JWT_SECRET=test-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
    fi
    
    print_status $GREEN "Test environment setup complete"
}

# Function to run unit tests
run_unit_tests() {
    print_status $BLUE "Running unit tests..."
    
    local cmd="npm run test"
    
    if [ "$COVERAGE" = true ]; then
        cmd="npm run test:cov"
    fi
    
    if [ "$WATCH" = true ]; then
        cmd="npm run test:watch"
    fi
    
    if [ "$VERBOSE" = true ]; then
        cmd="$cmd --verbose"
    fi
    
    if [ "$PARALLEL" = true ]; then
        cmd="$cmd --maxWorkers=4"
    fi
    
    eval $cmd
}

# Function to run integration tests
run_integration_tests() {
    print_status $BLUE "Running integration tests..."
    
    local cmd="npm run test -- tests/inte"
    
    if [ "$COVERAGE" = true ]; then
        cmd="npm run test:cov -- tests/inte"
    fi
    
    if [ "$VERBOSE" = true ]; then
        cmd="$cmd --verbose"
    fi
    
    if [ "$PARALLEL" = true ]; then
        cmd="$cmd --maxWorkers=2"
    fi
    
    eval $cmd
}

# Function to run e2e tests
run_e2e_tests() {
    print_status $BLUE "Running end-to-end tests..."
    
    local cmd="npm run test:e2e"
    
    if [ "$VERBOSE" = true ]; then
        cmd="$cmd --verbose"
    fi
    
    eval $cmd
}

# Function to run all tests
run_all_tests() {
    print_status $BLUE "Running all tests..."
    
    # Run unit tests
    run_unit_tests
    
    # Run integration tests
    run_integration_tests
    
    # Run e2e tests
    run_e2e_tests
}

# Function to generate coverage report
generate_coverage_report() {
    if [ "$COVERAGE" = true ]; then
        print_status $BLUE "Generating coverage report..."
        
        # Generate HTML coverage report
        if command_exists npx; then
            npx nyc report --reporter=html
            print_status $GREEN "Coverage report generated in tests/coverage/"
        else
            print_status $YELLOW "nyc not available, skipping coverage report generation"
        fi
    fi
}

# Function to cleanup test artifacts
cleanup() {
    print_status $BLUE "Cleaning up test artifacts..."
    
    # Remove test coverage files
    rm -rf tests/coverage/
    
    # Remove test database if it exists
    # Note: This would depend on your database setup
    
    print_status $GREEN "Cleanup complete"
}

# Function to validate test results
validate_test_results() {
    local exit_code=$1
    
    if [ $exit_code -eq 0 ]; then
        print_status $GREEN "All tests passed successfully!"
        
        if [ "$COVERAGE" = true ]; then
            print_status $BLUE "Coverage report available in tests/coverage/"
        fi
    else
        print_status $RED "Some tests failed. Exit code: $exit_code"
        exit $exit_code
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -w|--watch)
            WATCH=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -p|--parallel)
            PARALLEL=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_status $RED "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate test type
case $TEST_TYPE in
    unit|integration|e2e|all)
        ;;
    *)
        print_status $RED "Invalid test type: $TEST_TYPE"
        show_help
        exit 1
        ;;
esac

# Main execution
main() {
    print_status $GREEN "Starting test execution..."
    print_status $BLUE "Test type: $TEST_TYPE"
    print_status $BLUE "Coverage: $COVERAGE"
    print_status $BLUE "Watch mode: $WATCH"
    print_status $BLUE "Verbose: $VERBOSE"
    print_status $BLUE "Parallel: $PARALLEL"
    echo ""
    
    # Setup test environment
    setup_test_env
    
    # Run tests based on type
    case $TEST_TYPE in
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        all)
            run_all_tests
            ;;
    esac
    
    # Generate coverage report if requested
    generate_coverage_report
    
    # Validate results
    validate_test_results $?
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
