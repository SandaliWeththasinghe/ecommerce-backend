# E-Commerce Backend API

A robust and scalable e-commerce backend API built with NestJS, TypeScript, and PostgreSQL.

## Description

This is a production-ready e-commerce backend API that provides comprehensive order management functionality. Built with [NestJS](https://github.com/nestjs/nest) framework, it features TypeORM for database operations, comprehensive logging, pagination support, and interactive API documentation via Swagger.

## Features

- **Orders Management**: Complete CRUD operations for orders
- **Product Management**: Product entities and associations with orders
- **Pagination**: Built-in pagination support for listing orders
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Validation**: Request validation using class-validator
- **Database**: PostgreSQL with TypeORM
- **Logging**: Comprehensive logging throughout the application
- **CORS**: Enabled for cross-origin requests
- **Path Aliases**: Clean imports using @ alias
- **Testing**: Unit and E2E tests with Jest

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3.x
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Testing**: Jest
- **Package Manager**: Yarn

## Project Structure

```
src/
├── orders/              # Orders module
│   ├── dto/            # Data Transfer Objects
│   ├── entities/       # Database entities (Order, Product, OrderProductMap)
│   ├── interfaces/     # TypeScript interfaces
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── app.module.ts       # Root module
└── main.ts            # Application entry point
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Yarn** (v1.22 or higher)
- **PostgreSQL** (v12 or higher)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-backend
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Database setup

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ECOMMERCE;

# Exit psql
\q
```

### 4. Environment configuration

Create a `.env` file in the root directory with the following variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ECOMMERCE
PORT=5000
NODE_ENV=development
```

**Important**: Update the values according to your PostgreSQL configuration.

### 5. Database migrations

The application uses TypeORM with `synchronize: false` for production safety. You'll need to run migrations or set `synchronize: true` temporarily for development.

## Running the Application

### Development mode (recommended for development)

```bash
yarn start:dev
```

This starts the application with hot-reload enabled. The server will automatically restart when you make changes to the code.

### Standard development mode

```bash
yarn start
```

### Production mode

First, build the application:

```bash
yarn build
```

Then run the production build:

```bash
yarn start:prod
```

### Debug mode

```bash
yarn start:debug
```

## Accessing the Application

Once the application is running, you can access:

- **API Base URL**: `http://localhost:5000`
- **Swagger Documentation**: `http://localhost:5000/api/docs`

The Swagger UI provides interactive API documentation where you can test all endpoints.

## Available Scripts

### Development

```bash
yarn start          # Start the application
yarn start:dev      # Start with watch mode (hot-reload)
yarn start:debug    # Start in debug mode
```

### Build

```bash
yarn build          # Build the application for production
```

### Code Quality

```bash
yarn format         # Format code using Prettier
yarn lint           # Lint and fix code using ESLint
```

### Testing

```bash
yarn test           # Run unit tests
yarn test:watch     # Run tests in watch mode
yarn test:cov       # Run tests with coverage report
yarn test:debug     # Run tests in debug mode
yarn test:e2e       # Run end-to-end tests
```

## API Endpoints

### Orders

- `GET /orders` - Get all orders (with pagination)
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create a new order
- `PATCH /orders/:id` - Update an order
- `DELETE /orders/:id` - Delete an order

**Pagination Example**:
```
GET /orders?page=1&limit=10
```

For detailed API documentation with request/response schemas, visit the Swagger UI at `http://localhost:5000/api/docs`.

## Project Configuration

### TypeORM Configuration

The database connection is configured in [src/app.module.ts](src/app.module.ts):

- Database type: PostgreSQL
- Synchronize: `false` (for production safety)
- Entities: Auto-loaded from `**/*.entity.ts`

### Path Aliases

The project uses `@` as a path alias for the `src` directory:

```typescript
// Instead of: import { OrdersModule } from '../../orders/orders.module';
// You can use: import { OrdersModule } from '@/orders/orders.module';
```

### Validation

Global validation is enabled with:
- `whitelist: true` - Strip properties that don't have decorators
- `forbidNonWhitelisted: true` - Throw errors if non-whitelisted properties are present
- `transform: true` - Automatically transform payloads to DTO instances

## Testing

The project includes comprehensive testing:

- **Unit tests**: Testing individual services and controllers
- **E2E tests**: Testing complete request/response cycles
- **Coverage reports**: Generated in the `coverage/` directory

Example test run:

```bash
# Run all unit tests
yarn test

# Run with coverage
yarn test:cov

# Run specific test file
yarn test orders.service.spec.ts
```

## Troubleshooting

### Database connection issues

If you encounter database connection errors:

1. Verify PostgreSQL is running: `pg_isready`
2. Check your `.env` file configuration
3. Ensure the database exists: `psql -U postgres -l`
4. Verify credentials can connect: `psql -U postgres -d ECOMMERCE`

### Port already in use

If port 5000 is already in use, change the `PORT` in your `.env` file:

```env
PORT=3000
```

### Module not found errors

If you see module not found errors after installing dependencies:

```bash
# Clear node modules and reinstall
rm -rf node_modules
yarn install
```

## Development Guidelines

1. **Code Style**: Follow the existing code style. Run `yarn format` before committing.
2. **Linting**: Ensure no linting errors with `yarn lint`.
3. **Testing**: Write tests for new features and ensure all tests pass.
4. **Commits**: Write clear, descriptive commit messages.
5. **Type Safety**: Leverage TypeScript's type system fully.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

## License

UNLICENSED - Private project
