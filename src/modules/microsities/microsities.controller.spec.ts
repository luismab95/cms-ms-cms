import { Test, TestingModule } from '@nestjs/testing';
import { MicrositiesController } from './microsities.controller';
import { MicrositiesService } from './microsities.service';

describe('MicrositiesController', () => {
  let controller: MicrositiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicrositiesController],
      providers: [MicrositiesService],
    }).compile();

    controller = module.get<MicrositiesController>(MicrositiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
