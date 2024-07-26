import { Test, TestingModule } from '@nestjs/testing';
import { SitieController } from './sitie.controller';
import { SitieService } from './sitie.service';

describe('SitieController', () => {
  let controller: SitieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitieController],
      providers: [SitieService],
    }).compile();

    controller = module.get<SitieController>(SitieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
