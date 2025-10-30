import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const mockValues = {
                'app.name': 'Book Management System',
                'PORT': 3000,
              };
              return mockValues[key];
            },
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello from Book Management System on port 3000!"', () => {
      expect(appController.getHello()).toBe('Hello from Book Management System on port 3000!');
    });
  });
});
