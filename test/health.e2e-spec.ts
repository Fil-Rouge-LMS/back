import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { HealthRepository } from './../src/health/health.repository.js';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  afterEach(async () => {
    await app.close();
  });

  describe('with a reachable database', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('GET /health returns a JSend success without authentication', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect({ status: 'success', data: { status: 'ok' } });
    });

    it('GET /health/db returns a JSend success', () => {
      return request(app.getHttpServer())
        .get('/health/db')
        .expect(200)
        .expect({ status: 'success', data: { database: 'ok' } });
    });
  });

  describe('with an unreachable database', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(HealthRepository)
        .useValue({
          ping: () => Promise.reject(new Error('secret connection detail')),
        })
        .compile();

      app = moduleFixture.createNestApplication();
      app.useLogger(false);
      await app.init();
    });

    it('GET /health/db returns 503 without exposing the cause', () => {
      return request(app.getHttpServer())
        .get('/health/db')
        .expect(503)
        .expect({ status: 'error', message: 'Database unavailable' });
    });

    it('GET /health still returns 200', () => {
      return request(app.getHttpServer()).get('/health').expect(200);
    });
  });
});
