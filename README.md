# Book Management System API

A RESTful API built with NestJS for managing books and authors.

## Features

- CRUD operations for Authors and Books
- Data validation using class-validator
- Pagination and filtering
- Relationship management (Author-Book)
- Custom exception handling
- Unit and E2E tests for Authors
- TypeORM with SQLite (easily switchable to PostgreSQL)

## Installation
Rename `.env.example` to `.env` and update the values/settings to your own

```bash
npm install

# If you face any dependency version issues, use this command
npm install --legacy-peer-dep
```

## Running the app

```bash
# development
npm run start:dev

# production mode
npm run build
npm run start:prod
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Endpoints

### Authors

- `POST /authors` - Create a new author
- `GET /authors` - Get all authors (with pagination & search)
- `GET /authors/:id` - Get a single author
- `PATCH /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author

### Books

- `POST /books` - Create a new book
- `GET /books` - Get all books (with pagination & filtering)
- `GET /books/:id` - Get a single book
- `PATCH /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

## Example Requests

### Create Author
```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "J.K.",
    "lastName": "Rowling",
    "bio": "British author of Harry Potter series",
    "birthDate": "1965-07-31"
  }'
```

### Create Book
```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Harry Potter and the Philosopher'\''s Stone",
    "isbn": "978-0-7475-3269-9",
    "publishedDate": "1997-06-26",
    "genre": "Fantasy",
    "authorId": "<author-id-from-previous-request>"
  }'
```

### Get Authors with Pagination
```bash
curl "http://localhost:3000/authors?page=1&limit=10&firstName=J.K."
```

### Get Books by Author
```bash
curl "http://localhost:3000/books?authorId=<author-id>&page=1&limit=10"
```

## Database Choice

This project uses **SQLite** for simplicity and easy setup.

### Recommended for Production: PostgreSQL

**Reasons:**
- ACID compliance and robust transactions
- Advanced features (JSONB, full-text search, triggers)
- Better performance for complex queries
- Superior concurrency handling
- Excellent scalability
- Rich ecosystem and community support
- Built-in replication and backup

### Generating Migration with TypeORM

```bash
npm run typeorm -- migration:generate -d <ormconfig_path> -o your_schema_name

# example
npm run typeorm -- migration:generate -d ./ormconfig.js -o ./migrations/initial-schema
```

## Architecture Highlights

### Validation
- All DTOs use `class-validator` decorators
- Global validation pipe ensures type safety
- ISBN validation using `@IsISBN()` decorator

### Error Handling
- Custom exception filter for consistent error responses
- Proper HTTP status codes (400, 404, 409)
- Meaningful error messages

### Database Design
- One-to-Many relationship (Author → Books)
- Cascade rules prevent orphaned data
- UUID primary keys for better distribution
- Automatic timestamps (createdAt, updatedAt)

### Testing Strategy
- Unit tests for service layer with mocked repositories
- E2E tests for critical user flows
- Test coverage for edge cases (validation, not found, conflicts)

## Project Structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── common/                      # Shared utilities
│   └── filters/                 # Exception filters
├── authors/                     # Authors feature module
│   ├── entities/                # Author entity
│   ├── dto/                     # Data Transfer Objects
│   ├── authors.controller.ts    # REST endpoints
│   ├── authors.service.ts       # Business logic
│   └── authors.service.spec.ts  # Unit tests
└── books/                       # Books feature module
    ├── entities/                # Book entity
    ├── dto/                     # Data Transfer Objects
    ├── books.controller.ts      # REST endpoints
    └── books.service.ts         # Business logic
```

## License

MIT
