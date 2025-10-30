import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Authors (e2e)', () => {
  let app: INestApplication;
  let createdAuthorId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/authors (POST) - should create a new author', () => {
    return request(app.getHttpServer())
      .post('/authors')
      .send({
        firstName: 'Jane',
        lastName: 'Austen',
        bio: 'English novelist known for her romantic fiction',
        birthDate: '1775-12-16',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.firstName).toBe('Jane');
        expect(res.body.lastName).toBe('Austen');
        createdAuthorId = res.body.id;
      });
  });

  it('/authors/:id (GET) - should retrieve the created author', () => {
    return request(app.getHttpServer())
      .get(`/authors/${createdAuthorId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdAuthorId);
        expect(res.body.firstName).toBe('Jane');
        expect(res.body.lastName).toBe('Austen');
      });
  });

  it('/authors (GET) - should return paginated authors', () => {
    return request(app.getHttpServer())
      .get('/authors?page=1&limit=10')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('limit');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('/authors/:id (PATCH) - should update an author', () => {
    return request(app.getHttpServer())
      .patch(`/authors/${createdAuthorId}`)
      .send({
        bio: 'Updated bio for Jane Austen',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.bio).toBe('Updated bio for Jane Austen');
      });
  });

  it('/authors (POST) - should fail with validation error', () => {
    return request(app.getHttpServer())
      .post('/authors')
      .send({
        firstName: 'John',
        // Missing required lastName
      })
      .expect(400);
  });

  it('/authors/:id (GET) - should return 404 for non-existent author', () => {
    return request(app.getHttpServer())
      .get('/authors/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});