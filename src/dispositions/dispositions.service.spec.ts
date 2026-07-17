import { Test, TestingModule } from '@nestjs/testing';
import { DispositionsService } from './dispositions.service';

describe('DispositionsService', () => {
  let service: DispositionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DispositionsService],
    }).compile();

    service = module.get<DispositionsService>(DispositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
