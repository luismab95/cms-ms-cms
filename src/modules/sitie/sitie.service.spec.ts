import { Test, TestingModule } from '@nestjs/testing';
import { SitieService } from './sitie.service';

describe('SitieService', () => {
  let service: SitieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SitieService],
    }).compile();

    service = module.get<SitieService>(SitieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
