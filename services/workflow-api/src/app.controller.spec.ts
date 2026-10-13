import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = moduleRef.get(AppController);
  });

  describe('getInfo', () => {
    it('returns the service name and version', () => {
      expect(appController.getInfo()).toEqual({
        name: 'workflow-api',
        version: '0.1.0',
      });
    });
  });
});
