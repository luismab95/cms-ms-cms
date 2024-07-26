import { Test, TestingModule } from '@nestjs/testing';
import { MicrositiesService } from './microsities.service';

describe('MicrositiesService', () => {
  let service: MicrositiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MicrositiesService],
    }).compile();

    service = module.get<MicrositiesService>(MicrositiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
